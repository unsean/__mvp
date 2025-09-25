import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', letterSpacing: 0.5 },
  shimmer: {
    height: '100%', width: 120, backgroundColor: '#ececec', opacity: 0.5, position: 'absolute', left: 0, top: 0,
  },
  profileCard: {
    padding: 18, borderRadius: 18, marginBottom: 18, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, marginBottom: 10, backgroundColor: '#eee',
  },
  profileName: {
    fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 4,
  },
  profileBio: {
    color: '#888', fontSize: 14, marginBottom: 8,
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#FFB300', marginTop: 6,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center',
  },
  editModal: {
    width: 320, backgroundColor: '#fff', borderRadius: 18, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  input: {
    backgroundColor: '#f7f7f7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 16, width: '100%',
  },
  saveBtn: {
    backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8, width: '100%',
  },
  closeModalBtn: {
    position: 'absolute', right: 12, top: 12, padding: 8,
  },
  badge: {
    alignItems: 'center', marginRight: 18, backgroundColor: '#fff', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  badgeIcon: {
    width: 36, height: 36, marginBottom: 6,
  },
  badgeLabel: {
    fontSize: 13, color: '#222', fontWeight: 'bold',
  },
  statChartWrap: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18, marginTop: 8,
  },
  statChartTitle: {
    fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 6,
  },
  statBar: {
    flex: 1, marginHorizontal: 6, alignItems: 'center',
  },
  statBarLabel: {
    fontSize: 12, color: '#888', marginBottom: 2,
  },
  bar: {
    height: 8, borderRadius: 4, marginTop: 2,
  },
  logoutBtn: {
    marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6F61', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'center',
  },
  timelineRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f3f3',
  },
  timelineIcon: {
    width: 36, height: 36, borderRadius: 18, marginRight: 12, justifyContent: 'center', alignItems: 'center',
  },
  settingsSection: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18, marginTop: 8,
  },
  settingsHeader: {
    fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 6,
  },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f3f3',
  },
  settingLabel: {
    fontSize: 15, color: '#333',
  },
});

export default styles;
