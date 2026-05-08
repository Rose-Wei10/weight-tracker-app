import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  title: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },

  value: {
    fontSize: 18,
    fontWeight: '600',
  },

  goalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3B30',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 14,
  },

  editBtn: {
    alignSelf: 'flex-end',
    marginTop: 18,
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  editText: {
    color: '#fff',
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },

  activeBtn: {
    backgroundColor: '#007AFF',
  },

  optionText: {
    fontWeight: '600',
    color: '#333',
  },

  activeText: {
    color: '#fff',
  },

  levelContainer: {
    gap: 10,
  },

  levelBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },

  logoutBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});