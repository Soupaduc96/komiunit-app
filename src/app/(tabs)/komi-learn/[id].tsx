import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { ThemedText } from '@/components/themed-text';
import { Formatting } from '@/utils/formatting';
import { KomiLearnService } from '@/services/komi-learn/course-service';
import { useKomiLearn } from '@/hooks/use-komi-learn';
import { Colors, Spacing } from '@/constants/theme';
import { Course, Lesson } from '@/types/komi-learn';

const LEVEL_COLOR = { beginner: '#34C759', intermediate: '#FF9F0A', advanced: '#FF3B30' } as const;

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { enrollCourse, loading: enrollLoading } = useKomiLearn();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      KomiLearnService.getCourseById(id),
      KomiLearnService.getCourseLessons(id),
    ])
      .then(([courseData, lessonsData]) => {
        setCourse(courseData ?? null);
        setLessons(lessonsData);
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!id) return;
    try {
      await enrollCourse(id);
      setEnrolled(true);
    } catch {
      // handled by hook
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? Colors.dark.background : Colors.light.background },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingTop: insets.top + Spacing.two, paddingBottom: Spacing.two,
      paddingHorizontal: Spacing.three, borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    backButton: { marginRight: Spacing.two, padding: Spacing.one },
    backText: { fontSize: 16, color: '#007AFF' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: isDark ? Colors.dark.text : Colors.light.text },
    content: { padding: Spacing.three, paddingBottom: 90 },
    cover: {
      width: '100%', height: 180,
      backgroundColor: 'rgba(0,122,255,0.1)',
      borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.three,
    },
    levelBadge: {
      alignSelf: 'flex-start', paddingHorizontal: Spacing.two, paddingVertical: Spacing.half,
      borderRadius: 12, marginBottom: Spacing.two,
    },
    levelText: { fontSize: 12, fontWeight: '700' },
    title: { fontSize: 22, fontWeight: 'bold', color: isDark ? Colors.dark.text : Colors.light.text, marginBottom: Spacing.one },
    instructor: { fontSize: 14, color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary, marginBottom: Spacing.two },
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.three },
    stat: { fontSize: 13, color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary },
    descCard: { marginBottom: Spacing.three },
    desc: { fontSize: 15, lineHeight: 24, color: isDark ? Colors.dark.text : Colors.light.text },
    lessonItem: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.two, gap: Spacing.two,
      borderBottomWidth: 1, borderBottomColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    lessonNum: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      justifyContent: 'center', alignItems: 'center',
    },
    lessonNumText: { fontSize: 12, fontWeight: '700', color: isDark ? Colors.dark.text : Colors.light.text },
    lessonTitle: { flex: 1, fontSize: 14, color: isDark ? Colors.dark.text : Colors.light.text },
    lessonDuration: { fontSize: 12, color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary },
    bottomBar: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: Spacing.three, paddingBottom: insets.bottom + Spacing.two,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      borderTopWidth: 1, borderTopColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  });

  const headerRow = (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.headerTitle}>Course Details</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {headerRow}
        <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>
      </View>
    );
  }

  if (loadError || !course) {
    return (
      <View style={styles.container}>
        {headerRow}
        <EmptyState
          title="Course Not Found"
          description={loadError ?? 'This course could not be loaded'}
          actionTitle="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const levelColor = LEVEL_COLOR[course.level] ?? '#007AFF';
  const totalMinutes = lessons.reduce((s, l) => s + (l.duration ?? 0), 0);
  const durationText = totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    : `${totalMinutes}m`;

  return (
    <View style={styles.container}>
      {headerRow}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cover}><Text style={{ fontSize: 60 }}>📚</Text></View>

        <View style={[styles.levelBadge, { backgroundColor: `${levelColor}20` }]}>
          <Text style={[styles.levelText, { color: levelColor }]}>
            {course.level.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.instructor}>by {course.instructorName}</Text>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>⭐ {course.rating.toFixed(1)}</Text>
          <Text style={styles.stat}>👥 {course.enrollments.toLocaleString()} enrolled</Text>
          <Text style={styles.stat}>⏱ {durationText}</Text>
          <Text style={styles.stat}>💰 {Formatting.currency(course.price)}</Text>
        </View>

        <Card style={styles.descCard}>
          <ThemedText type="subtitle" style={{ fontSize: 16, marginBottom: Spacing.two }}>About this Course</ThemedText>
          <Text style={styles.desc}>{course.description}</Text>
        </Card>

        {lessons.length > 0 && (
          <Card>
            <ThemedText type="subtitle" style={{ fontSize: 16, marginBottom: Spacing.two }}>
              Course Content ({lessons.length} lessons)
            </ThemedText>
            {lessons.map((lesson, idx) => (
              <View
                key={lesson.id}
                style={[styles.lessonItem, idx === lessons.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={styles.lessonNum}>
                  <Text style={styles.lessonNumText}>{idx + 1}</Text>
                </View>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonDuration}>{lesson.duration}m</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={enrolled ? '✓ Enrolled — Continue' : `Enroll Now — ${Formatting.currency(course.price)}`}
          onPress={enrolled ? () => router.push('/(tabs)/komi-learn/my-courses') : handleEnroll}
          loading={enrollLoading}
          fullWidth
        />
      </View>
    </View>
  );
}
