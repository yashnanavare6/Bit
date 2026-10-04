/**
 * Quorum Frontend API Client
 */

import axios from "axios";

// Intelligently resolve the API base URL:
// 1. Explicit VITE_API_URL environment variable
// 2. If running in browser on production (e.g. Render, custom domain), default to current origin
// 3. Fallback to local development port 5000
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return window.location.origin;
    }
  }
  return "http://localhost:5000";
};

const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 25000,
});

// Built-in resilient demo fallback data for judges if backend is waking up from sleep
const FALLBACK_DEMO_DATA = {
  verified: {
    id: "demo-verified-record",
    owner: "vitejs",
    repo: "vite",
    repository: "vitejs/vite",
    commit: "91af82e430da275685dfbc599a00b8e723553258",
    mode: "DEMO MODE",
    status: "COMPLETED",
    result: "VERIFIED",
    consensus: {
      status: "COMPLETED",
      result: "VERIFIED",
      message: "All three isolated builders reproduced the same artifact from the same immutable source commit.",
      consensusRatio: "3/3",
      consensusPercentage: 100,
      agreedHash: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
    },
    builders: [
      {
        name: "Builder A",
        status: "verified",
        hash: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
        buildCommand: "npm run build",
        environment: "GitHub-hosted isolated runner (Ubuntu 24.04)",
        duration: "16.2s",
      },
      {
        name: "Builder B",
        status: "verified",
        hash: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
        buildCommand: "npm run build",
        environment: "GitHub-hosted isolated runner (Ubuntu 22.04)",
        duration: "16.8s",
      },
      {
        name: "Builder C",
        status: "verified",
        hash: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
        buildCommand: "npm run build",
        environment: "GitHub-hosted isolated runner (Ubuntu 24.04)",
        duration: "17.0s",
      },
    ],
    hashComparison: {
      hashA: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
      hashB: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
      hashC: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
      aEqualsB: true,
      aEqualsC: true,
      bEqualsC: true,
    },
  },
  conflict: {
    id: "demo-conflict-record",
    owner: "vitejs",
    repo: "vite",
    repository: "vitejs/vite",
    commit: "91af82e430da275685dfbc599a00b8e723553258",
    mode: "DEMO MODE — SIMULATED BUILDER CONFLICT",
    isTamperedDemo: true,
    status: "COMPLETED",
    result: "VERIFICATION CONFLICT",
    consensus: {
      status: "COMPLETED",
      result: "VERIFICATION CONFLICT",
      message: "Builder outputs differ for the same immutable source commit.",
      consensusRatio: "2/3",
      consensusPercentage: 67,
      agreedHash: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
    },
    builders: [
      {
        name: "Builder A",
        status: "verified",
        hash: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
        buildCommand: "npm run build",
        environment: "GitHub-hosted isolated runner (Ubuntu 24.04)",
        duration: "16.2s",
      },
      {
        name: "Builder B",
        status: "verified",
        hash: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
        buildCommand: "npm run build",
        environment: "GitHub-hosted isolated runner (Ubuntu 22.04)",
        duration: "16.9s",
      },
      {
        name: "Builder C",
        status: "conflict",
        hash: "73kd19a2b84cf019eec8a33501fbb892c55e90214a72d733ecbe12089b21844a",
        buildCommand: "npm run build",
        environment: "GitHub-hosted isolated runner (Ubuntu 24.04)",
        duration: "17.1s",
        logs: ["⚠️ [DEMO CONFLICT] Injected tamper signature into artifact after build."],
      },
    ],
    hashComparison: {
      hashA: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
      hashB: "91af82e430da275685dfbc599a00b8e723553258c701f016abef9eefca88921b",
      hashC: "73kd19a2b84cf019eec8a33501fbb892c55e90214a72d733ecbe12089b21844a",
      aEqualsB: true,
      aEqualsC: false,
      bEqualsC: false,
    },
  },
};

export const verificationApi = {
  /**
   * Dynamically analyzes any public repository, resolves branch/tag to commit,
   * detects frameworks, package managers, and build commands.
   */
  analyzeRepository: async ({ repository, ref = null }) => {
    const response = await api.post("/api/analyze-repository", {
      repository,
      ref,
    });
    return response.data;
  },

  /**
   * Initiates a release verification
   */
  startVerification: async ({
    repository,
    commit,
    ref = null,
    releaseArtifact = null,
    forceSimulated = false,
    projectConfig = {},
    demoConflict = false,
  }) => {
    const response = await api.post("/api/verify", {
      repository,
      commit,
      ref,
      releaseArtifact,
      forceSimulated,
      projectConfig,
      demoConflict,
    });
    return response.data;
  },

  /**
   * Polls the live status of an ongoing or completed verification session
   */
  getVerificationStatus: async (verificationId) => {
    const response = await api.get(`/api/verify/${verificationId}`);
    return response.data;
  },

  /**
   * Simulates builder tampering for hackathon live demo
   */
  simulateTampering: async (verificationId) => {
    const response = await api.post("/api/simulate-tampering", {
      verificationId,
    });
    return response.data;
  },

  /**
   * Retrieves verification records with search, filter, and sort
   */
  getHistory: async ({ search = "", status = "ALL", sortBy = "date_desc" } = {}) => {
    try {
      const response = await api.get("/api/history", {
        params: { search, status, sortBy },
      });
      return response.data;
    } catch (err) {
      // Fallback records if server is cold-starting
      return {
        total: 2,
        records: [
          {
            id: "qrm-hist-001",
            repository: "facebook/react",
            commit: "c55e90214a72d733ecbe12089b21844a91ad22e1",
            date: new Date().toISOString(),
            status: "COMPLETED",
            result: "VERIFIED",
            consensusRatio: "3/3",
            consensusPercentage: 100,
            duration: "24.6s",
            mode: "DEMO_HISTORY",
            isDemoHistory: true,
          },
          {
            id: "qrm-hist-002",
            repository: "random-user/unpinned-crypto-bot",
            commit: "73dd19a2b84cf019eec8a33501fbb892c55e9021",
            date: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: "COMPLETED",
            result: "VERIFICATION CONFLICT",
            consensusRatio: "2/3",
            consensusPercentage: 66,
            duration: "21.0s",
            mode: "DEMO_HISTORY",
            isDemoHistory: true,
          },
        ],
      };
    }
  },

  /**
   * Fetches instant preset demo results (verified, conflict, failed, no_consensus, release_mismatch)
   * Guaranteed to work even if Render is cold-starting.
   */
  getDemoScenario: async (type = "verified") => {
    try {
      const response = await api.get(`/api/demo/${type}`);
      return response.data;
    } catch (err) {
      console.warn("Backend unavailable for demo scenario, loading resilient fallback data:", err.message);
      if (FALLBACK_DEMO_DATA[type]) {
        return FALLBACK_DEMO_DATA[type];
      }
      return FALLBACK_DEMO_DATA.verified;
    }
  },

  /**
   * Retrieves safe engine diagnostics
   */
  getSystemStatus: async () => {
    const response = await api.get("/api/system-status");
    return response.data;
  },
};

export default verificationApi;
