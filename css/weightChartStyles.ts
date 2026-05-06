import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  emptyBox: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rangeText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },

  tab: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },

  activeTab: {
    marginHorizontal: 10,
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },

  tooltip: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000',
    padding: 8,
    borderRadius: 8,
  },

  tooltipText: {
    color: '#fff',
    fontWeight: '600',
  },

  tooltipDate: {
    color: '#ccc',
    fontSize: 12,
  },

  latest: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    fontStyle: 'italic',
  },

  sub: {
    color: '#999',
  },
});