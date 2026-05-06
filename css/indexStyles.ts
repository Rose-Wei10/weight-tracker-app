import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F7',
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 20,
  },
  
  lang: {
    marginTop: -15,
    color: '#007AFF', 
    fontWeight: '600'
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 10,
  },

  primaryBtn: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  progressText: {
    marginTop: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },

  logout: {
    textAlign: 'center',
    marginTop: 20,
    color: '#FF3B30',
    fontSize: 16,
  },
    infoText: {
    fontSize: 15,
    marginTop: 6,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  rowText: {
    fontSize: 15,
    fontWeight: '500',
  },

  edit: {
    color: '#007AFF',
    fontWeight: '600',
  },

  delete: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  addSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
  },

  addInput: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  addBtn: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});