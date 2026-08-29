import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { Users, Search, Shield } from 'lucide-react';
import { getCustomers, updateUserRole } from '../../services/adminService';
import type { Profile, UserRole } from '../../types/database';
import { cn } from '../../lib/utils';

const ROLE_STYLES: Record<UserRole, string> = {
  customer: 'bg-charcoal-100 text-charcoal-600',
  staff:    'bg-blue-100 text-blue-700',
  admin:    'bg-primary-100 text-primary-700',
};

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [filtered,  setFiltered]  = useState<Profile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [updating,  setUpdating]  = useState<string | null>(null);

  useEffect(() => {
    getCustomers()
      .then((data) => { setCustomers(data); setFiltered(data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? customers.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone?.includes(q),
      ) : customers,
    );
  }, [search, customers]);

  async function handleRoleChange(userId: string, role: UserRole) {
    setUpdating(userId);
    try {
      await updateUserRole(userId, role);
      setCustomers((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, role } : c)),
      );
    } finally {
      setUpdating(null);
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal-800">Customers</h1>
          <p className="text-charcoal-500 text-sm mt-0.5">{customers.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
      </div>

      {loading ? (
        <LoadingState message="Loading customers…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users className="w-10 h-10" />} title={search ? 'No results' : 'No customers yet'} />
      ) : (
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-50 border-b border-charcoal-100">
                <tr>
                  {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Change Role'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-charcoal-50/50">
                    <td className="px-4 py-3 font-medium text-charcoal-800 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {(c.full_name ?? c.email)[0].toUpperCase()}
                        </span>
                        {c.full_name ?? <span className="text-charcoal-400 italic">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">{c.email}</td>
                    <td className="px-4 py-3 text-charcoal-500">{c.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', ROLE_STYLES[c.role])}>
                        {c.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal-400 text-xs whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-charcoal-300" aria-hidden="true" />
                        <select
                          value={c.role}
                          disabled={updating === c.id}
                          onChange={(e) => handleRoleChange(c.id, e.target.value as UserRole)}
                          className="text-xs border border-charcoal-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
