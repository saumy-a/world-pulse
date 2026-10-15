import axios from "axios";
import { collect } from "../github";

// ─── Mock axios ───────────────────────────────────────────────────────────────

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makePushEvent = (overrides: Record<string, unknown> = {}) => ({
  id: "12345678901",
  type: "PushEvent",
  actor: { login: "testuser", display_login: "testuser" },
  repo: { name: "testuser/test-repo", url: "https://api.github.com/repos/testuser/test-repo" },
  payload: {
    commits: [
      { message: "fix: correct typo in README", url: "https://github.com/testuser/test-repo/commit/abc" },
      { message: "chore: bump version", url: "https://github.com/testuser/test-repo/commit/def" },
    ],
  },
  public: true,
  created_at: "2024-01-15T10:00:00Z",
  ...overrides,
});

const makeReleaseEvent = () => ({
  id: "99999999999",
  type: "ReleaseEvent",
  actor: { login: "releaser", display_login: "releaser" },
  repo: { name: "testorg/myapp", url: "https://api.github.com/repos/testorg/myapp" },
  payload: {
    action: "published",
    release: {
      name: "v2.0.0",
      tag_name: "v2.0.0",
      html_url: "https://github.com/testorg/myapp/releases/tag/v2.0.0",
      body: "Major release with breaking changes.",
    },
  },
  public: true,
  created_at: "2024-01-15T11:00:00Z",
});

const makePREvent = () => ({
  id: "55555555555",
  type: "PullRequestEvent",
  actor: { login: "contributor" },
  repo: { name: "org/project", url: "https://api.github.com/repos/org/project" },
  payload: {
    action: "opened",
    pull_request: {
      title: "Add dark mode support",
      html_url: "https://github.com/org/project/pull/42",
      body: "This PR adds dark mode to the dashboard.",
    },
  },
  public: true,
  created_at: "2024-01-15T12:00:00Z",
});

const makePrivateEvent = () => ({
  ...makePushEvent(),
  id: "private-event-1",
  public: false,
});

const makeRateLimitError = () =>
  Object.assign(new Error("Request failed with status code 403"), {
    isAxiosError: true,
    response: {
      status: 403,
      headers: {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 3600),
      },
      data: { message: "API rate limit exceeded" },
    },
  });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GitHub Collector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.GITHUB_TOKEN;
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  describe("collect()", () => {
    it("returns normalized WorldEvents for a successful API response", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [makePushEvent(), makeReleaseEvent(), makePREvent()],
        headers: { "x-ratelimit-remaining": "59", "x-ratelimit-limit": "60" },
        status: 200,
      });

      const events = await collect();

      expect(events).toHaveLength(3);
      expect(events[0]).toMatchObject({
        source: "github",
        category: "technology",
        type: "PushEvent",
      });
    });

    it("correctly normalizes a PushEvent", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [makePushEvent()],
        headers: {},
        status: 200,
      });

      const [event] = await collect();

      expect(event.id).toBe("github-12345678901");
      expect(event.sourceEventId).toBe("12345678901");
      expect(event.title).toBe("testuser pushed 2 commits to testuser/test-repo");
      expect(event.description).toBe("fix: correct typo in README | chore: bump version");
      expect(event.url).toBe("https://github.com/testuser/test-repo");
      expect(event.timestamp).toBe("2024-01-15T10:00:00.000Z");
      expect(event.importance).toBe(3);
      expect(event.tags).toContain("github");
      expect(event.tags).toContain("PushEvent");
    });

    it("correctly normalizes a ReleaseEvent with high importance", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [makeReleaseEvent()],
        headers: {},
        status: 200,
      });

      const [event] = await collect();

      expect(event.title).toBe("releaser released v2.0.0 of testorg/myapp");
      expect(event.url).toBe("https://github.com/testorg/myapp/releases/tag/v2.0.0");
      expect(event.importance).toBe(8);
      expect(event.description).toContain("Major release");
    });

    it("correctly normalizes a PullRequestEvent", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [makePREvent()],
        headers: {},
        status: 200,
      });

      const [event] = await collect();

      expect(event.title).toBe("contributor opened PR: Add dark mode support");
      expect(event.url).toBe("https://github.com/org/project/pull/42");
      expect(event.importance).toBe(4);
    });

    it("returns an empty array when the API returns an empty list", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [],
        headers: {},
        status: 200,
      });

      const events = await collect();
      expect(events).toHaveLength(0);
    });

    it("filters out private events", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [makePushEvent(), makePrivateEvent()],
        headers: {},
        status: 200,
      });

      const events = await collect();
      // Only the public event should pass through
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe("github-12345678901");
    });

    it("sends Authorization header when GITHUB_TOKEN is set", async () => {
      process.env.GITHUB_TOKEN = "ghp_test_token_12345";

      mockedAxios.get.mockResolvedValueOnce({
        data: [],
        headers: {},
        status: 200,
      });

      await collect();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer ghp_test_token_12345",
          }),
        })
      );
    });

    it("does NOT send Authorization header when GITHUB_TOKEN is not set", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [],
        headers: {},
        status: 200,
      });

      await collect();

      const callArgs = mockedAxios.get.mock.calls[0][1] as { headers: Record<string, string> };
      expect(callArgs.headers).not.toHaveProperty("Authorization");
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("returns empty array on 403 rate limit without throwing", async () => {
      mockedAxios.get.mockRejectedValueOnce(makeRateLimitError());

      const events = await collect();
      expect(events).toHaveLength(0);
    });

    it("returns empty array on 304 Not Modified without throwing", async () => {
      const notModifiedErr = Object.assign(new Error("Not Modified"), {
        isAxiosError: true,
        response: { status: 304, headers: {}, data: null },
      });
      mockedAxios.get.mockRejectedValueOnce(notModifiedErr);

      const events = await collect();
      expect(events).toHaveLength(0);
    });

    it("throws an error for unexpected API errors (non-403, non-304)", async () => {
      const serverErr = Object.assign(new Error("Request failed with status code 500"), {
        isAxiosError: true,
        response: { status: 500, headers: {}, data: { message: "Server error" } },
      });
      mockedAxios.get.mockRejectedValueOnce(serverErr);

      await expect(collect()).rejects.toThrow("[github-collector] GitHub API error");
    });

    it("throws an error if API response is not an array", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { message: "not an array" },
        headers: {},
        status: 200,
      });

      await expect(collect()).rejects.toThrow(
        "[github-collector] Unexpected API response: expected an array"
      );
    });
  });

  // ── Data integrity ──────────────────────────────────────────────────────────

  describe("data integrity", () => {
    it("all returned events have required WorldEvent fields", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [makePushEvent(), makeReleaseEvent(), makePREvent()],
        headers: {},
        status: 200,
      });

      const events = await collect();

      for (const event of events) {
        expect(typeof event.id).toBe("string");
        expect(event.id.length).toBeGreaterThan(0);
        expect(event.source).toBe("github");
        expect(typeof event.title).toBe("string");
        expect(event.title.length).toBeGreaterThan(0);
        expect(typeof event.timestamp).toBe("string");
        expect(new Date(event.timestamp).getTime()).not.toBeNaN();
        expect(typeof event.importance).toBe("number");
        expect(event.importance).toBeGreaterThanOrEqual(0);
        expect(event.importance).toBeLessThanOrEqual(10);
        expect(event.category).toBe("technology");
      }
    });

    it("event IDs are unique across multiple events", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [makePushEvent(), makeReleaseEvent(), makePREvent()],
        headers: {},
        status: 200,
      });

      const events = await collect();
      const ids = events.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(events.length);
    });
  });
});
