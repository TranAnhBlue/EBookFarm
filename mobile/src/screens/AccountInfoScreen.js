import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../api/api';
import * as ImagePicker from 'expo-image-picker';

export default function AccountInfoScreen({ navigation }) {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    phone: user?.phone || '',
    address: user?.address || '',
    province: user?.province || '',
    ward: user?.ward || '',
    organization: user?.organization || '',
    bio: user?.bio || '',
    farmName: user?.farmName || '',
    farmCode: user?.farmCode || '',
    farmArea: user?.farmArea || '',
  });

  const updateMutation = useMutation({
    mutationFn: (values) => api.put('/users/profile', values),
    onSuccess: (res) => {
      const updatedUser = res.data.data;
      setUser(updatedUser);
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => {
      Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra khi lưu hồ sơ!');
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Upload avatar logic here
      Alert.alert('Thông báo', 'Chức năng upload ảnh đang được phát triển');
    }
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const canEditPhone = ['Admin', 'HTX'].includes(user?.role);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(user?.fullname || user?.username || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.fullname || user?.username}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'Admin' ? 'Quản trị viên' : 
             user?.role === 'Farmer' ? 'Nông dân' : 
             user?.role === 'HTX' ? 'Hợp tác xã' : 
             user?.role}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên *</Text>
            <TextInput
              style={styles.input}
              value={formData.fullname}
              onChangeText={(text) => setFormData({ ...formData, fullname: text })}
              placeholder="Nhập họ và tên"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={[styles.input, !canEditPhone && styles.inputDisabled]}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              editable={canEditPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tổ chức/Công ty</Text>
            <TextInput
              style={styles.input}
              value={formData.organization}
              onChangeText={(text) => setFormData({ ...formData, organization: text })}
              placeholder="Nhập tên tổ chức"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới thiệu ngắn</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Viết vài dòng về bạn..."
              multiline
              numberOfLines={3}
            />
          </View>

          <Text style={styles.sectionTitle}>Địa chỉ</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tỉnh/Thành phố</Text>
            <TextInput
              style={styles.input}
              value={formData.province}
              onChangeText={(text) => setFormData({ ...formData, province: text })}
              placeholder="Nhập tỉnh/thành phố"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phường/Xã</Text>
            <TextInput
              style={styles.input}
              value={formData.ward}
              onChangeText={(text) => setFormData({ ...formData, ward: text })}
              placeholder="Nhập phường/xã"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ chi tiết</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Nhập địa chỉ chi tiết"
            />
          </View>

          {['Farmer', 'User'].includes(user?.role) && (
            <>
              <Text style={styles.sectionTitle}>Thông tin nông trại</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên nông trại</Text>
                <TextInput
                  style={styles.input}
                  value={formData.farmName}
                  onChangeText={(text) => setFormData({ ...formData, farmName: text })}
                  placeholder="Nhập tên nông trại"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mã nông trại</Text>
                <TextInput
                  style={styles.input}
                  value={formData.farmCode}
                  onChangeText={(text) => setFormData({ ...formData, farmCode: text })}
                  placeholder="Nhập mã nông trại"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Diện tích (m²)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.farmArea}
                  onChangeText={(text) => setFormData({ ...formData, farmArea: text })}
                  placeholder="Nhập diện tích"
                  keyboardType="numeric"
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, updateMutation.isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={updateMutation.isLoading}
        >
          {updateMutation.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  formSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#9ca3af',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
