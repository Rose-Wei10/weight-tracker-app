import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { PanGestureHandler } from 'react-native-gesture-handler';

export default function WeightChart({ history = [], goal }: any) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 70;

  // 📊 State
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 📅 Filter data based on view
  const filtered = useMemo(() => {
    if (!history || history.length === 0) return [];

    const now = new Date(currentDate);

    let result = [];

    if (viewMode === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - 6);

        result = history.filter((h: any) => {
        const d = new Date(h.date);
        return d >= start && d <= now;
        });
    } else {
        result = history.filter((h: any) => {
        const d = new Date(h.date);
        return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
        );
        });
    }

    // ✅ FALLBACK (THIS FIXES YOUR BUG)
    if (result.length === 0) {
        return history.slice(-7);
    }

    return result;
    }, [history, currentDate, viewMode]);

  // 🧠 Chart data
  const labels = filtered.map((h: any) =>
    h.date ? h.date.slice(5) : ''
  );

  const weights = filtered.map((h: any) => h.weight);

  // Prevent empty crash
  if (!filtered.length) {
    return (
      <View style={styles.emptyBox}>
        <Text style={{ color: '#999' }}>No data yet</Text>
      </View>
    );
  }

  // 📈 Chart dataset
  const data = {
    labels,
    datasets: [
      {
        data: weights,
        strokeWidth: 3,
      },
      {
        data: weights.map(() => goal),
        withDots: true,
        color: () => 'red',
        strokeWidth: 2,
      },
    ],
  };

  // 👆 Swipe handling
  const handleSwipe = (e: any) => {
    const dx = e.nativeEvent.translationX;

    const newDate = new Date(currentDate);

    if (dx < -50) {
        newDate.setDate(newDate.getDate() + 7);
    } else if (dx > 50) {
        newDate.setDate(newDate.getDate() - 7);
    }

    // 🚫 prevent going too far future
    const today = new Date();
    if (newDate > today) return;

    setCurrentDate(newDate);
    };

  return (
    <View>
      {/* 📅 Range */}
      <Text style={styles.rangeText}>
        {labels[0]} - {labels[labels.length - 1]}
      </Text>

      {/* 🔘 Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity onPress={() => setViewMode('week')}>
          <Text
            style={viewMode === 'week' ? styles.activeTab : styles.tab}
          >
            Week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setViewMode('month')}>
          <Text
            style={viewMode === 'month' ? styles.activeTab : styles.tab}
          >
            Month
          </Text>
        </TouchableOpacity>
      </View>

      {/* 📊 Chart */}
      <PanGestureHandler onEnded={handleSwipe}>
        <View style={{marginLeft: -10}}>
          <LineChart
            data={data}
            width={chartWidth}
            height={220}
            withDots
            withInnerLines
            withOuterLines={false}
            withShadow={true}
            fromZero={false}
            segments={4}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: () => '#007AFF',
              labelColor: () => '#999',
              propsForDots: {
                r: '5',
              },
            }}
            
            onDataPointClick={({ index }) => {
              setSelectedIndex(index);
            }}
            style={{
              borderRadius: 16,
            }}
          />

          {/* 📍 Tooltip */}
          {selectedIndex !== null && filtered[selectedIndex] && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>
                {filtered[selectedIndex].weight} kg
              </Text>
              <Text style={styles.tooltipDate}>
                {filtered[selectedIndex].date}
              </Text>
            </View>
          )}
        </View>
      </PanGestureHandler>

      {/* 📊 Latest */}
      <Text style={styles.latest}>
        {weights[weights.length - 1]} kg
      </Text>
      <Text style={styles.sub}>Latest</Text>
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
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