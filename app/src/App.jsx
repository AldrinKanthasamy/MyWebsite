import React, { useEffect, useState } from "react";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load posts (check console).");
    } finally {
      setLoading(false);
    }
  }

  async function createPost(e) {
    e.preventDefault();
    const apiKey = prompt("Enter admin API key (this won't be stored):");
    if (!apiKey) return;
    const payload = {
      title: form.title,
      content: form.content,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean)
    };
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
      }
      await fetchPosts();
      setShowForm(false);
      setForm({ title: "", content: "", tags: "" });
      alert("Post created!");
    } catch (err) {
      alert("Error creating post: " + err.message);
    }
  }

  return (
    <div className="p-8">
      <header className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-5xl font-extrabold uppercase tracking-wide drop-shadow-lg">AK — Funky Portfolio</h1>
        <p className="mt-2 text-xl opacity-90">Creativity, hobbies & learnings — neon vibes ✨</p>
        <div className="mt-4">
          <button onClick={() => setShowForm((s) => !s)} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">New post (admin)</button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={createPost} className="max-w-3xl mx-auto mb-8 bg-white/5 p-6 rounded-2xl backdrop-blur">
          <input className="w-full mb-3 p-3 rounded bg-white/5" placeholder="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
          <textarea className="w-full mb-3 p-3 rounded bg-white/5" placeholder="Content" rows="6" value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} />
          <input className="w-full mb-3 p-3 rounded bg-white/5" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded bg-green-500 text-black font-semibold">Publish</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded bg-red-400">Cancel</button>
          </div>
        </form>
      )}

      <main className="max-w-4xl mx-auto">
        {loading ? <p>Loading posts…</p> : posts.length === 0 ? <p>No posts yet — create one!</p> : (
          <div className="grid gap-4">
            {posts.map(p => (
              <article key={p.id} className="p-6 rounded-2xl bg-white/6 border border-white/10">
                <h2 className="text-2xl font-bold">{p.title}</h2>
                <p className="mt-2 whitespace-pre-line">{p.content}</p>
                <div className="mt-3 text-sm opacity-80">{new Date(p.createdAt).toLocaleString()}</div>
                <div className="mt-2 flex gap-2">{(p.tags||[]).map(t => <span key={t} className="text-xs bg-white/10 px-2 py-1 rounded-full">{t}</span>)}</div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
