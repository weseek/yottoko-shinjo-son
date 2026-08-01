"use client";

import { authClient } from "@/lib/auth-client";
import { useCallback, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  createdAt: Date;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await authClient.admin.listUsers({ query: {} });
    if (data?.users) {
      setUsers(data.users as User[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    const { error } = await authClient.admin.createUser({
      email: createEmail,
      password: createPassword,
      name: createName,
      role: "admin",
    });
    setCreating(false);
    if (error) {
      setCreateError(
        error.status === 409
          ? "このメールアドレスは既に登録されています"
          : "ユーザーの作成に失敗しました",
      );
      return;
    }
    setCreateEmail("");
    setCreatePassword("");
    setCreateName("");
    await fetchUsers();
  }

  async function handleDelete(userId: string) {
    await authClient.admin.removeUser({ userId });
    await fetchUsers();
  }

  const isOnlyUser = users.length <= 1;

  return (
    <div>
      <h1>ユーザー管理</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          {isOnlyUser && users.length === 1 && (
            <output>最後の管理者アカウントは削除できません</output>
          )}
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                {user.name} ({user.email})
                <button
                  type="button"
                  onClick={() => handleDelete(user.id)}
                  disabled={isOnlyUser}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>新規ユーザー作成</h2>
      <form onSubmit={handleCreate}>
        <input
          type="email"
          value={createEmail}
          onChange={(e) => setCreateEmail(e.target.value)}
          required
          placeholder="メールアドレス"
        />
        <input
          type="password"
          value={createPassword}
          onChange={(e) => setCreatePassword(e.target.value)}
          required
          placeholder="パスワード"
        />
        <input
          type="text"
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          required
          placeholder="名前"
        />
        {createError && <p role="alert">{createError}</p>}
        <button type="submit" disabled={creating}>
          {creating ? "作成中..." : "ユーザーを作成"}
        </button>
      </form>
    </div>
  );
}
