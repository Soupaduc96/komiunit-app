import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Header } from '@/components/navigation/header';
import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Loading } from '@/components/common/loading';
import { EmptyState } from '@/components/common/empty-state';
import { CourseCard } from '@/components/komi-learn/course-card';
import { ThemedText } from '@/components/themed-text';
import { useKomiLearn } from '@/hooks/use-komi-learn';
import { Colors, Spacing } from '@/constants/theme';
import { Course } from '@/types/komi-learn';

export default function KomiLearnScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { courses, loading, error, getCourses } = useKomiLearn();

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    content: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      paddingBottom: insets.bottom + Spacing.three,
    },
    section: {
      marginVertical: Spacing.three,
    },
    buttonContainer: {
      gap: Spacing.two,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.two,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
      padding: Spacing.two,
    },
  });

  const renderCourse = ({ item }: { item: Course }) => (
    <CourseCard
      key={item.id}
      course={item}
      onPress={() => router.push({ pathname: '/(tabs)/komi-learn/[id]', params: { id: item.id } })}
    />
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
          <Header title="KomiLearn" subtitle="Expand your knowledge" />

          <View style={styles.section}>
            <Card style={{ marginBottom: Spacing.two, padding: Spacing.three }}>
              <ThemedText type="subtitle" style={{ fontSize: 18, marginBottom: Spacing.one }}>
                Learning Hub
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Grow your skills with expert-led courses
              </ThemedText>
            </Card>

            <View style={styles.buttonContainer}>
              <Button
                title="My Courses"
                onPress={() => router.push('/(tabs)/komi-learn/my-courses')}
                fullWidth
              />
              <Button
                title="Continue Learning"
                onPress={() => router.push('/(tabs)/komi-learn/my-courses')}
                variant="secondary"
                fullWidth
              />
            </View>
          </View>

          <View style={[styles.section, { marginBottom: Spacing.two }]}>
            <ThemedText style={styles.sectionTitle}>Recommended Courses</ThemedText>
            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
          </View>
        </>
      }
      data={loading && courses.length === 0 ? [] : courses}
      keyExtractor={(item) => item.id}
      renderItem={renderCourse}
      ListEmptyComponent={
        loading ? (
          <Loading visible={true} overlay={false} text="Loading courses..." />
        ) : (
          <EmptyState
            title="No Courses Available"
            description="Check back later for new courses"
          />
        )
      }
    />
  );
}
