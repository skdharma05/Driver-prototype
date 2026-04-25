import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  ScrollView, StyleSheet, Pressable, Dimensions
} from 'react-native';
import { X } from 'lucide-react-native';
import TruckIcon from './TruckIcon';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 4;  // 4 columns with padding

// Grid items per category — matches reference image layout
const CATEGORY_GRID_ITEMS = {
  open: [
    { id: '17ft',       label: '17 Feet'     },
    { id: '19ft',       label: '19 Feet'     },
    { id: '20ft',       label: '20 Feet'     },
    { id: '22ft',       label: '22 Feet'     },
    { id: '24ft',       label: '24 Feet'     },
    { id: '10w',        label: '10 Wheeler'  },
    { id: '12w',        label: '12 Wheeler'  },
    { id: '14w',        label: '14 Wheeler'  },
    { id: '16w',        label: '16 Wheeler'  },
    { id: '18w',        label: '18 Wheeler'  },
  ],
  container: [
    { id: '19ft',       label: '19 Feet'     },
    { id: '20ft',       label: '20 Feet'     },
    { id: '22ft',       label: '22 Feet'     },
    { id: '24ft',       label: '24 Feet'     },
    { id: '32sxl',      label: '32ft SXL'   },
    { id: '32mxl',      label: '32ft MXL'   },
    { id: '32txl',      label: '32ft TXL'   },
  ],
  lcv: [
    { id: '4w',         label: '4 Wheeler'   },
    { id: '6w',         label: '6 Wheeler'   },
    { id: '14ft',       label: '14 Feet'     },
    { id: '17ft',       label: '17 Feet'     },
    { id: '19ft',       label: '19 Feet'     },
    { id: '20ft',       label: '20 Feet'     },
    { id: '22ft',       label: '22 Feet'     },
    { id: '24ft',       label: '24 Feet'     },
  ],
  mini: [
    { id: 'ace075',     label: 'Ace 0.75T'  },
    { id: 'ace1',       label: 'Ace 1T'     },
    { id: 'dost15',     label: 'Dost 1.5T'  },
    { id: 'dost2',      label: 'Dost 2T'    },
  ],
  trailer: [
    { id: 'dala',       label: 'Dala Body'   },
    { id: 'flatbed',    label: 'Flat Bed'    },
    { id: '22t',        label: '22 Ton'      },
    { id: '25t',        label: '25 Ton'      },
    { id: '30t',        label: '30 Ton'      },
    { id: '35t',        label: '35 Ton'      },
    { id: '40t',        label: '40 Ton'      },
    { id: '43t',        label: '43 Ton'      },
  ],
  industrial: [
    { id: 'tanker',     label: 'Tanker'      },
    { id: 'tipper',     label: 'Tipper'      },
    { id: 'bulker',     label: 'Bulker'      },
  ],
};

const VehicleFilterSheet = ({ visible, category, onClose, onSelect }) => {
  const [selected, setSelected] = useState(null);
  const items = CATEGORY_GRID_ITEMS[category] || [];
  const catLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : '';

  const handleSelect = (item) => {
    setSelected(item.id);
    onSelect({ category, ...item });  // ← filter loads instantly
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dim background */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>

        {/* Header — "Open" + ✕ */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{catLabel}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Grid — 4 columns exactly like reference */}
        <ScrollView contentContainerStyle={styles.grid}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.gridCard,
                selected === item.id && styles.gridCardSelected
              ]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.75}
            >
              {/* Truck icon — same style as reference */}
              <View style={styles.gridCardIcon}>
                <TruckIcon
                  category={category}
                  size={38}
                  color={selected === item.id ? '#1E3A8A' : '#6B7280'}
                />
              </View>
              {/* Label below icon */}
              <Text style={[
                styles.gridCardLabel,
                selected === item.id && styles.gridCardLabelSelected
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  closeBtn:   { padding: 4 },

  // 4-column grid — exactly like reference
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  gridCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  gridCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#22C55E',   // ← green border when selected
  },
  gridCardIcon:  { alignItems: 'center', justifyContent: 'center' },
  gridCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  gridCardLabelSelected: { color: '#1E3A8A' },
});

export default VehicleFilterSheet;
