import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState } from '../../components/ui/States';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { getSiteSettings, updateSiteSetting } from '../../services/adminService';

interface SettingGroup {
  title: string;
  description: string;
  keys: { key: string; label: string; type?: string; placeholder?: string }[];
}

const SETTING_GROUPS: SettingGroup[] = [
  {
    title: 'Restaurant Info',
    description: 'Basic information about the restaurant.',
    keys: [
      { key: 'restaurant_name', label: 'Restaurant Name' },
      { key: 'tagline',         label: 'Tagline' },
      { key: 'phone',           label: 'Phone Number', type: 'tel' },
      { key: 'whatsapp',        label: 'WhatsApp Number (no spaces)', type: 'tel', placeholder: '+2347053357203' },
      { key: 'email',           label: 'Contact Email', type: 'email' },
      { key: 'address',         label: 'Main Address' },
    ],
  },
  {
    title: 'Social Media',
    description: 'Social media profile URLs.',
    keys: [
      { key: 'instagram', label: 'Instagram URL', type: 'url', placeholder: 'https://www.instagram.com/...' },
      { key: 'tiktok',    label: 'TikTok URL',    type: 'url', placeholder: 'https://www.tiktok.com/@...' },
    ],
  },
  {
    title: 'Ordering & Delivery',
    description: 'Delivery and ordering configuration.',
    keys: [
      { key: 'delivery_fee',       label: 'Delivery Fee (₦)',         type: 'number', placeholder: '0' },
      { key: 'min_order_amount',   label: 'Minimum Order Amount (₦)', type: 'number', placeholder: '0' },
      { key: 'currency',           label: 'Currency Code',            placeholder: 'NGN' },
    ],
  },
];

export function AdminSettingsPage() {
  const [settings,  setSettings]  = useState<Record<string, string>>({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState<string | null>(null);
  const [saved,     setSaved]     = useState<string | null>(null);
  const [localVals, setLocalVals] = useState<Record<string, string>>({});

  useEffect(() => {
    getSiteSettings()
      .then((data) => { setSettings(data); setLocalVals(data); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(key: string) {
    setSaving(key);
    try {
      await updateSiteSetting(key, localVals[key] ?? '');
      setSettings((prev) => ({ ...prev, [key]: localVals[key] ?? '' }));
      setSaved(key);
      setTimeout(() => setSaved(null), 2500);
    } finally {
      setSaving(null);
    }
  }

  const inputCls =
    'flex-1 min-w-0 px-3 py-2.5 rounded-md border border-charcoal-200 text-sm text-charcoal-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-300 transition-colors';

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-charcoal-800">Settings</h1>
        <p className="text-charcoal-500 text-sm mt-0.5">Configure restaurant information and business settings.</p>
      </div>

      {loading ? (
        <LoadingState message="Loading settings…" />
      ) : (
        <div className="space-y-6">
          {SETTING_GROUPS.map((group) => (
            <div key={group.title} className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal-50">
                <div className="flex items-center gap-2 mb-0.5">
                  <Settings className="w-4 h-4 text-primary-600" aria-hidden="true" />
                  <h2 className="font-semibold text-charcoal-800">{group.title}</h2>
                </div>
                <p className="text-xs text-charcoal-500">{group.description}</p>
              </div>

              <div className="px-6 py-4 space-y-4">
                {group.keys.map(({ key, label, type = 'text', placeholder }) => {
                  const isDirty   = localVals[key] !== settings[key];
                  const isSaving  = saving === key;
                  const wasSaved  = saved === key;

                  return (
                    <div key={key}>
                      <label htmlFor={key} className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        {label}
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          id={key}
                          type={type}
                          value={localVals[key] ?? ''}
                          placeholder={placeholder}
                          onChange={(e) => setLocalVals((prev) => ({ ...prev, [key]: e.target.value }))}
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => handleSave(key)}
                          disabled={!isDirty || isSaving}
                          aria-label={`Save ${label}`}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary-700 text-white hover:bg-primary-800"
                        >
                          {wasSaved ? (
                            <CheckCircle className="w-4 h-4 text-green-300" aria-hidden="true" />
                          ) : (
                            <Save className="w-4 h-4" aria-hidden="true" />
                          )}
                          <span className="hidden sm:inline">
                            {isSaving ? 'Saving…' : wasSaved ? 'Saved' : 'Save'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
