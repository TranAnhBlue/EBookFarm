import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

export default function JournalEntryScreen({ route, navigation }) {
  const { schemaId, journalId } = route.params || {};
  const queryClient = useQueryClient();
  const isEditing = !!journalId;

  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch schema structure
  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ['schema', schemaId],
    queryFn: async () => {
      const { data } = await api.get(`/schemas/${schemaId}`);
      return data.data;
    },
    enabled: !!schemaId,
  });

  // Fetch journal if editing
  const { data: journal, isLoading: journalLoading } = useQuery({
    queryKey: ['journal', journalId],
    queryFn: async () => {
      const { data } = await api.get(`/journals/${journalId}`);
      return data.data;
    },
    enabled: isEditing,
  });

  // Initialize form data when journal loads
  useEffect(() => {
    if (journal && schema) {
      const initialData = {};
      schema.tables.forEach((table) => {
        initialData[table.tableName] = journal.data?.[table.tableName] || {};
      });
      setFormData(initialData);
    } else if (schema) {
      const initialData = {};
      schema.tables.forEach((table) => {
        initialData[table.tableName] = {};
      });
      setFormData(initialData);
    }
  }, [journal, schema]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ data, status }) => {
      const payload = {
        schemaId,
        data,
        status,
      };

      if (isEditing) {
        const response = await api.put(`/journals/${journalId}`, payload);
        return response.data;
      } else {
        const response = await api.post('/journals', payload);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['journals']);
      queryClient.invalidateQueries(['journal', journalId]);
      Alert.alert('Thành công', 'Nhật ký đã được lưu!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể lưu nhật ký');
    },
  });

  const handleSave = (status = 'Draft') => {
    setIsSaving(true);
    saveMutation.mutate({ data: formData, status }, {
      onSettled: () => setIsSaving(false),
    });
  };

  const handleFieldChange = (tableName, fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [tableName]: {
        ...prev[tableName],
        [fieldName]: value,
      },
    }));
  };

  const renderField = (field, tableName) => {
    const value = formData[tableName]?.[field.fieldName] || '';

    switch (field.fieldType) {
      case 'text':
      case 'number':
        return (
          <View key={field.fieldName} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.input}
              value={String(value)}
              onChangeText={(text) => handleFieldChange(tableName, field.fieldName, text)}
              placeholder={`Nhập ${field.label.toLowerCase()}`}
              keyboardType={field.fieldType === 'number' ? 'numeric' : 'default'}
            />
          </View>
        );

      case 'textarea':
        return (
          <View key={field.fieldName} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={String(value)}
              onChangeText={(text) => handleFieldChange(tableName, field.fieldName, text)}
              placeholder={`Nhập ${field.label.toLowerCase()}`}
              multiline
              numberOfLines={4}
            />
          </View>
        );

      case 'select':
        return (
          <View key={field.fieldName} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.selectOption,
                    value === option && styles.selectOptionActive,
                  ]}
                  onPress={() => handleFieldChange(tableName, field.fieldName, option)}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      value === option && styles.selectOptionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'date':
        return (
          <View key={field.fieldName} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.input}
              value={String(value)}
              onChangeText={(text) => handleFieldChange(tableName, field.fieldName, text)}
              placeholder="DD/MM/YYYY"
            />
          </View>
        );

      default:
        return null;
    }
  };

  if (schemaLoading || journalLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!schema) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Không tìm thấy biểu mẫu</Text>
      </View>
    );
  }

  const currentTable = schema.tables[activeTab];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isEditing ? 'Sửa nhật ký' : 'Tạo nhật ký mới'}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {schema.schemaName}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {schema.tables.map((table, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeTab === index && styles.tabActive]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
              {table.tableName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Form Content */}
      <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent}>
        {currentTable.fields.map((field) => renderField(field, currentTable.tableName))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => handleSave('Draft')}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#6b7280" />
          ) : (
            <>
              <Feather name="save" size={20} color="#6b7280" />
              <Text style={styles.buttonSecondaryText}>Lưu nháp</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => handleSave('Submitted')}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="send" size={20} color="#fff" />
              <Text style={styles.buttonPrimaryText}>Gửi duyệt</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#22c55e',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#fff',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectOptionActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  selectOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectOptionTextActive: {
    color: '#16a34a',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  buttonPrimary: {
    backgroundColor: '#22c55e',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
