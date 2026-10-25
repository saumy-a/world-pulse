import axios, { AxiosError } from "axios";
import { normalizeEvent } from "@world-pulse/shared-utils";
import { EventCategory, EventSource } from "@world-pulse/shared-types";
import type { WorldEvent } from "@world-pulse/shared-types";

// ─── GitHub REST API types ────────────────────────────────────────────────────

interface GitHubActor {
  login: string;
  display_login?: string;
}

interface GitHubRepo {
  name: string; // "owner/repo"
  url: string;
}

interface GitHubPayload {
  action?: string;
  ref?: string;
  ref_type?: string;
  description?: string;
  pusher_type?: string;
  commits?: Array<{ message: string; url: string }>;
  pull_request?: {
    title: string;
    html_url: string;
    body?: string;
  };
  issue?: {
    title: string;
    html_url: string;
    body?: string;
  };
  release?: {
    name?: string;
    tag_name: string;
    html_url: string;
    body?: string;
  };
  forkee?: {
    full_name: string;
    html_url: string;
  };
}

interface GitHubEvent {
  id: string;
  type: string | null;
  actor: GitHubActor;
  repo: GitHubRepo;
  payload: GitHubPayload;
  public: boolean;
  created_at: string | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const GITHUB_API_URL = "https://api.github.com/events";
const PER_PAGE = 100; // max allowed by GitHub API

/**
 * Map a GitHub event type to a human-readable title.
 */
function buildTitle(event: GitHubEvent): string {
  const actor = event.actor.display_login ?? event.actor.login;
  const repo = event.repo.name;
  const payload = event.payload;

  switch (event.type) {
    case "PushEvent": {
      const count = payload.commits?.length ?? 0;
      return `${actor} pushed ${count} commit${count !== 1 ? "s" : ""} to ${repo}`;
    }
    case "PullRequestEvent":
      return `${actor} ${payload.action ?? "updated"} PR: ${payload.pull_request?.title ?? repo}`;
    case "IssuesEvent":
      return `${actor} ${payload.action ?? "updated"} issue: ${payload.issue?.title ?? repo}`;
    case "CreateEvent":
      return `${actor} created ${payload.ref_type ?? "ref"} in ${repo}`;
    case "DeleteEvent":
      return `${actor} deleted ${payload.ref_type ?? "ref"} in ${repo}`;
    case "ForkEvent":
      return `${actor} forked ${repo}`;
    case "WatchEvent":
      return `${actor} starred ${repo}`;
    case "ReleaseEvent":
      return `${actor} released ${payload.release?.tag_name ?? "new version"} of ${repo}`;
    case "IssueCommentEvent":
      return `${actor} commented on an issue in ${repo}`;
    case "PullRequestReviewEvent":
      return `${actor} reviewed a PR in ${repo}`;
    case "PullRequestReviewCommentEvent":
      return `${actor} commented on a PR review in ${repo}`;
    case "CommitCommentEvent":
      return `${actor} commented on a commit in ${repo}`;
    case "GollumEvent":
      return `${actor} updated the wiki in ${repo}`;
    case "MemberEvent":
      return `${actor} ${payload.action ?? "updated"} a collaborator in ${repo}`;
    case "PublicEvent":
      return `${actor} made ${repo} public`;
    default:
      return `${actor} triggered ${event.type ?? "event"} in ${repo}`;
  }
}

/**
 * Build a description for the event.
 */
function buildDescription(event: GitHubEvent): string | undefined {
  const payload = event.payload;

  if (payload.pull_request?.body) return payload.pull_request.body.slice(0, 500);
  if (payload.issue?.body) return payload.issue.body.slice(0, 500);
  if (payload.release?.body) return payload.release.body?.slice(0, 500);
  if (payload.commits && payload.commits.length > 0) {
    return payload.commits
      .slice(0, 3)
      .map((c) => c.message.split("\n")[0])
      .join(" | ");
  }
  return undefined;
}

/**
 * Build the canonical URL for the event.
 */
function buildUrl(event: GitHubEvent): string {
  const payload = event.payload;
  if (payload.pull_request?.html_url) return payload.pull_request.html_url;
  if (payload.issue?.html_url) return payload.issue.html_url;
  if (payload.release?.html_url) return payload.release.html_url;
  if (payload.forkee?.html_url) return payload.forkee.html_url;
  return `https://github.com/${event.repo.name}`;
}

/**
 * Assign an importance score (0–10) based on event type and signals.
 */
function calcImportance(event: GitHubEvent): number {
  switch (event.type) {
    case "ReleaseEvent":
      return 8;
    case "PullRequestEvent":
      return event.payload.action === "closed" ? 6 : 4;
    case "IssuesEvent":
      return 3;
    case "PushEvent":
      return 3;
    case "ForkEvent":
      return 4;
    case "CreateEvent":
      return 4;
    case "WatchEvent":
      return 2;
    default:
      return 2;
  }
}

/**
 * Normalize a raw GitHub event into a WorldEvent.
 */
function normalizeGitHubEvent(event: GitHubEvent): WorldEvent {
  return normalizeEvent({
    id: `github-${event.id}`,
    source: EventSource.GitHub,
    sourceEventId: event.id,
    type: event.type ?? "GitHubEvent",
    category: EventCategory.Technology,
    title: buildTitle(event),
    description: buildDescription(event),
    url: buildUrl(event),
    tags: ["github", event.type ?? "event", event.repo.name.split("/")[0]].filter(Boolean),
    timestamp: event.created_at ?? new Date().toISOString(),
    importance: calcImportance(event),
    metadata: {
      actor: event.actor.login,
      repo: event.repo.name,
      eventType: event.type,
    },
  });
}

// ─── Main collector ───────────────────────────────────────────────────────────

/**
 * Fetches public GitHub events and returns normalized WorldEvent objects.
 *
 * Environment variables:
 *   GITHUB_TOKEN — optional personal access token (raises rate limit to 5,000/hr)
 *
 * GitHub API rate limits:
 *   - Without token: 60 requests/hr (shared by IP)
 *   - With token:  5,000 requests/hr
 *
 * @returns Array of normalized WorldEvent objects
 */
export async function collect(): Promise<WorldEvent[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "world-pulse-collector/1.0",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await axios.get<GitHubEvent[]>(GITHUB_API_URL, {
      headers,
      params: { per_page: PER_PAGE },
      timeout: 10_000,
    });
  } catch (err) {
    const axiosErr = err as AxiosError;

    if (axiosErr.response?.status === 403) {
      const remaining = axiosErr.response.headers["x-ratelimit-remaining"];
      const resetEpoch = axiosErr.response.headers["x-ratelimit-reset"];
      const resetAt = resetEpoch
        ? new Date(Number(resetEpoch) * 1000).toISOString()
        : "unknown";

      console.warn(
        `[github-collector] Rate limit hit. Remaining: ${remaining ?? 0}. Resets at: ${resetAt}`
      );
      return [];
    }

    if (axiosErr.response?.status === 304) {
      // Not Modified — no new events since last poll
      console.info("[github-collector] No new events (304 Not Modified)");
      return [];
    }

    throw new Error(
      `[github-collector] GitHub API error: ${axiosErr.message} (status: ${axiosErr.response?.status ?? "unknown"})`
    );
  }

  // Log rate-limit headers for observability
  const remaining = response.headers["x-ratelimit-remaining"];
  const limit = response.headers["x-ratelimit-limit"];
  if (remaining !== undefined && limit !== undefined) {
    console.info(`[github-collector] Rate limit: ${remaining}/${limit} remaining`);
  }

  const rawEvents: GitHubEvent[] = response.data;

  if (!Array.isArray(rawEvents)) {
    throw new Error("[github-collector] Unexpected API response: expected an array");
  }

  // Only process public events (should always be true at /events, but be safe)
  const publicEvents = rawEvents.filter((e) => e.public);

  const normalized = publicEvents.map(normalizeGitHubEvent);

  console.info(`[github-collector] Fetched ${publicEvents.length} events, normalized ${normalized.length}`);

  return normalized;
}
