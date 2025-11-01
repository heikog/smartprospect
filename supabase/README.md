## Supabase Setup

1. **Projekt erstellen**
   - Region: EU (z.B. Frankfurt).
   - E-Mail-Login aktivieren, Passwortlose Magic Links einschalten.

2. **Schema deployen**
   ```bash
   supabase db push --file supabase/schema/001_init.sql
   ```

3. **Storage-Bucket**
   - Bucket `campaigns` anlegen (privat).
   - Struktur:
     ```
     campaigns/
       inputs/{campaignId}/service.pdf
       prospects/{campaignId}/{prospectId}/video.mp4
       ...
     ```

4. **Service Key**
   - `SUPABASE_SERVICE_ROLE_KEY` für Backend & n8n speichern (keine Freigabe fürs Frontend).

5. **Policies**
   - RLS ist in der Migration aktiv.
   - Prüfen, ob zusätzliche Policies für Admin-/Support-Rollen benötigt werden.

6. **Realtime**
   - Falls Kampagnen-Status in Echtzeit gestreamt werden soll: Table `campaigns` und `prospects` in Realtime-Dashboard aktivieren.

7. **Wartung**
   - Backup-Plan & PITR konfigurieren (Supabase Dashboard).
   - Monitor für Storage-Quotas anlegen.

