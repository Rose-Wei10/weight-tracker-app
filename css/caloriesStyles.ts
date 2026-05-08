import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    subtitle: {
        color: '#888',
        fontSize: 16,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    bigNumber: {
        fontSize: 54,
        fontWeight: '700',
        lineHeight: 58,
    },
    label: {
        color: '#888',
    },
    dropdown: {
        textAlign: 'center',
        color: '#007AFF',
        marginTop: 10,
    },
    input: {
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    btn: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    suggestionBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    foodChip: {
        backgroundColor: '#007AFF15',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        },
    foodChipText: {
        color: '#007AFF',
        fontWeight: '600',
    },
});