import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { Loading } from '@/components/common/loading';
import { ThemedText } from '@/components/themed-text';
import { useKomiLearn } from '@/hooks/use-komi-learn';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';
import { UserProgress } from '@/types/komi-learn';

export default function MyCoursesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { enrolledCourses, loading, error, getEnrolledCourses } = useKomiLearn();

  useEffect(() => {
    getEnrolledCourses();
  }, [getEnrolledCourses]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: insets.top + Spacing.two,
      paddingBottom: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    backButton: { marginRight: Spacing.two, padding: Spacing.one },
    backText: { fontSize: 16, color: '#007AFF' },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      flex: 1,
    },
    content: {
      padding: Spacing.three,
      paddingBottom: insets.bottom + Spacing.three,
    },
    courseCard: { marginBottom: Spacing.two },
    courseCover: {
      width: '100%',
      height: 100,
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },
    coverIcon: { fontSize: 36 },
    courseTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.one,
    },
    progressBar: {
      height: 6,
      backgroundColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
      borderRadius: 3,
      marginBottom: Spacing.one,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#007AFF',
      borderRadius: 3,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.two,
    },
    progressText: {
      fontSize: 13,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    completedBadge: {
      fontSize: 12,
      color: '#34C759',
      fontWeight: '700',
    },
    courseFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    startedDate: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
  });

  const renderProgress = ({ item }: { item: UserProgress }) => (
    <Card style={styles.courseCard}>
      <View style={styles.courseCover}>
        <Text style={styles.coverIcon}>📚</Text>
      </View>
      <Text style={styles.courseTitle}>{item.course?.title ?? 'Course'}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${item.progressPercentage}%` }]} />
      </View>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{item.progressPercentage}% complete</Text>
        {item.certificateEarned && <Text style={styles.completedBadge}>🏆 Certified</Text>}
      </View>
      <View style={styles.courseFooter}>
        <Text style={styles.startedDate}>Started {Formatting.relative(item.startedAt)}</Text>
        <Button
          title={item.progressPercentage === 100 ? 'Review' : 'Continue'}
          onPress={() =>
            router.push({ pathname: '/(tabs)/komi-learn/[id]', params: { id: item.courseId } })
          }
          size="small"
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>My Courses</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        data={loading && enrolledCourses.length === 0 ? [] : enrolledCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderProgress}
        ListEmptyComponent={
          loading ? (
            <Loading visible={true} overlay={false} text="Loading courses..." />
          ) : (
            <EmptyState
              title="No Enrolled Courses"
              description="Enroll in courses to start learning"
              actionTitle="Browse Courses"
              onAction={() => router.back()}
            />
          )
        }
      />
    </View>
  );
}
