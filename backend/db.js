/**
 * Local PostgreSQL connection has been decommissioned.
 * This stub prevents accidental usage of a local DB (e.g., localhost:5432).
 *
 * If you need server-side data access, migrate these routes to use Supabase
 * via the existing `services/supabase` client on the app side or create a
 * server-side Supabase client here using service role keys (NOT recommended
 * to embed in client apps). For now, any attempt to call `pool.query` will
 * throw a clear error.
 */

const disabledPool = {
  async query() {
    throw new Error(
      'Local PostgreSQL DB has been disabled. Please migrate this route to use Supabase or another remote data source.'
    );
  },
};

module.exports = disabledPool;
