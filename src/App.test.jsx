// The backend isn't running in tests, so fetch is replaced with a fake
// API that keeps todos in memory.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";

function json(body, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

function fakeApi(initial = []) {
  let todos = [...initial];
  let nextId = todos.length + 1;
  return vi.fn((url, options = {}) => {
    const method = options.method || "GET";
    const id = Number(url.split("/").pop());
    if (method === "GET") return json(todos);
    if (method === "POST") {
      const todo = { id: nextId++, completed: false, ...JSON.parse(options.body) };
      todos = [todo, ...todos];
      return json(todo, 201);
    }
    if (method === "PUT") {
      todos = todos.map((t) => (t.id === id ? { ...t, ...JSON.parse(options.body) } : t));
      return json(todos.find((t) => t.id === id));
    }
    if (method === "DELETE") {
      todos = todos.filter((t) => t.id !== id);
      return Promise.resolve(new Response(null, { status: 204 }));
    }
  });
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fakeApi([{ id: 1, title: "Existing todo", completed: false }]));
  });

  it("shows todos loaded from the API", async () => {
    render(<App />);
    expect(await screen.findByText("Existing todo")).toBeInTheDocument();
  });

  it("adds a todo", async () => {
    render(<App />);
    await screen.findByText("Existing todo");

    await userEvent.type(screen.getByPlaceholderText("What needs to be done?"), "Write tests");
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Write tests")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What needs to be done?")).toHaveValue("");
  });

  it("ignores an empty title", async () => {
    render(<App />);
    await screen.findByText("Existing todo");

    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(fetch).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: "POST" }));
  });

  it("marks a todo as done", async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole("checkbox"));

    expect(await screen.findByRole("checkbox")).toBeChecked();
  });

  it("deletes a todo", async () => {
    render(<App />);
    await screen.findByText("Existing todo");

    await userEvent.click(screen.getByRole("button", { name: "✕" }));

    expect(await screen.findByText("No todos yet.")).toBeInTheDocument();
  });

  it("shows an error when the backend is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network down"))));
    render(<App />);
    expect(await screen.findByText(/Could not reach the backend: Network down/)).toBeInTheDocument();
  });
});
