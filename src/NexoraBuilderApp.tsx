import { useEffect, useState, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface NexoraBuilderAppProps {
  domain: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  tableName?: string;
}

export function NexoraBuilderApp({
  domain,
  supabaseUrl,
  supabaseAnonKey,
  tableName = 'published_pages',
}: NexoraBuilderAppProps) {
  const [supabase] = useState<SupabaseClient>(() =>
    createClient(supabaseUrl, supabaseAnonKey)
  );
  const [contentJson, setContentJson] = useState<string>('{}');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  // Load existing content on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('domain', domain)
          .maybeSingle();

        if (error) {
          console.error('Error loading page:', error.message);
        } else if (data) {
          setContentJson(JSON.stringify(data.content_json, null, 2));
          setExistingId(data.id);
          setLastStatus(data.status);
        }
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [domain, supabase, tableName]);

  const handleSave = useCallback(
    async (status: 'draft' | 'published') => {
      setSaving(true);
      try {
        let parsed: any;
        try {
          parsed = JSON.parse(contentJson);
        } catch {
          alert('JSON inválido. Corrige el contenido antes de guardar.');
          setSaving(false);
          return;
        }

        const { error } = await supabase.from(tableName).upsert(
          {
            domain,
            content_json: parsed,
            status,
          },
          { onConflict: 'domain' }
        );

        if (error) {
          alert(`Error al guardar: ${error.message}`);
        } else {
          setLastStatus(status);
          alert(status === 'published' ? 'Página publicada ✓' : 'Borrador guardado ✓');
        }
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      } finally {
        setSaving(false);
      }
    },
    [contentJson, domain, supabase, tableName]
  );

  if (loading) {
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <p>Cargando contenido para <strong>{domain}</strong>...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 8 }}>Nexora Builder</h2>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Dominio: <strong>{domain}</strong>
        {lastStatus && (
          <span
            style={{
              marginLeft: 12,
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 12,
              background: lastStatus === 'published' ? '#d4edda' : '#fff3cd',
              color: lastStatus === 'published' ? '#155724' : '#856404',
            }}
          >
            {lastStatus}
          </span>
        )}
      </p>

      <textarea
        value={contentJson}
        onChange={(e) => setContentJson(e.target.value)}
        style={{
          width: '100%',
          minHeight: 400,
          fontFamily: 'monospace',
          fontSize: 13,
          padding: 12,
          border: '1px solid #ccc',
          borderRadius: 6,
          resize: 'vertical',
        }}
      />

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#fff',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Guardando...' : 'Guardar borrador'}
        </button>
        <button
          onClick={() => handleSave('published')}
          disabled={saving}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: 'none',
            background: '#16a34a',
            color: '#fff',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  );
}
