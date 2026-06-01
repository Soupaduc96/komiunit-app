import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Course } from '@/types/komi-learn';
import { Colors, Spacing } from '@/constants/theme';

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
  onEnroll?: () => void;
  isEnrolled?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPress,
  onEnroll,
  isEnrolled = false,
}) => {
  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    card: {
      marginBottom: Spacing.two,
    },
    image: {
      width: '100%',
      height: 150,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      borderRadius: 8,
      marginBottom: Spacing.one,
    },
    header: {
      marginBottom: Spacing.one,
    },
    level: {
      fontSize: 12,
      color: '#007AFF',
      fontWeight: '600',
      marginBottom: Spacing.half,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    instructor: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: Spacing.half,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.one,
    },
    info: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
  });

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.image} />
      <View style={styles.header}>
        <Text style={styles.level}>{course.level.toUpperCase()}</Text>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.instructor}>by {course.instructorName}</Text>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.info}>⭐ {course.rating}</Text>
          <Text style={styles.info}>👥 {course.enrollments} enrolled</Text>
        </View>
        <Button
          title={isEnrolled ? 'Continue' : 'Enroll'}
          onPress={onEnroll ?? (() => {})}
          variant={isEnrolled ? 'secondary' : 'primary'}
          size="small"
        />
      </View>
    </Card>
  );
};
