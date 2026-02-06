import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type ItemStatus = "pending" | "active" | "archived";

type Item = {
  id: string;
  name: string;
  description: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const Index = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ItemStatus>("pending");
  const [filterStatus, setFilterStatus] = useState<ItemStatus | "">("");
  const [search, setSearch] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus) {
      params.set("status", filterStatus);
    }
    if (search.trim()) {
      params.set("q", search.trim());
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [filterStatus, search]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/items${queryString}`);
      if (!response.ok) {
        throw new Error("Failed to load items.");
      }
      const data = (await response.json()) as { items: Item[] };
      setItems(data.items);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Unexpected error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, status }),
      });
      if (!response.ok) {
        throw new Error("Failed to create item.");
      }
      setName("");
      setDescription("");
      setStatus("pending");
      await fetchItems();
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Unexpected error.";
      setError(message);
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete item.");
      }
      await fetchItems();
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Unexpected error.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">CBIT Items Dashboard</h1>
          <p className="text-muted-foreground">
            Create, filter, and manage items stored in the backend API.
          </p>
        </header>

        <section className="grid gap-6 rounded-lg border border-border bg-card p-6 shadow-sm md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-xl font-semibold">Create a new item</h2>
            <form className="mt-4 flex flex-col gap-4" onSubmit={handleCreate}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="item-name">
                  Name
                </label>
                <input
                  id="item-name"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Add a short title"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="item-description">
                  Description
                </label>
                <textarea
                  id="item-description"
                  className="min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional details"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="item-status">
                  Status
                </label>
                <select
                  id="item-status"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ItemStatus)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                type="submit"
              >
                Save item
              </button>
            </form>
          </div>
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-4">
            <h2 className="text-lg font-semibold">Filter items</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="filter-status">
                  Status
                </label>
                <select
                  id="filter-status"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filterStatus}
                  onChange={(event) =>
                    setFilterStatus(event.target.value as ItemStatus | "")
                  }
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="filter-search">
                  Search
                </label>
                <input
                  id="filter-search"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Type to filter by name or description"
                />
              </div>
              <button
                className="rounded-md border border-border px-3 py-2 text-sm font-semibold"
                type="button"
                onClick={fetchItems}
              >
                Refresh list
              </button>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Items</h2>
            <span className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${items.length} total`}
            </span>
          </div>
          <div className="mt-4 grid gap-4">
            {items.length === 0 && !loading ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No items found. Create one to get started.
              </div>
            ) : null}
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-2 rounded-md border border-border px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.status.toUpperCase()} • Updated{" "}
                      {new Date(item.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    className="rounded-md border border-destructive px-3 py-1 text-xs font-semibold text-destructive"
                    type="button"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
                {item.description ? (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No description provided.
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
