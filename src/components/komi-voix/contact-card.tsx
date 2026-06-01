import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Formatting } from '@/utils/formatting';
import { Contact } from '@/types/komi-voix';
import { Colors, Spacing } from '@/constants/theme';

interface ContactCardProps {
  contact: Contact;
  onCall?: () => void;
  onMessage?: () => void;
  onPress?: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onCall,
  onMessage,
  onPress,
}) => {
  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    card: {
      marginBottom: Spacing.two,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.two,
    },
    avatarText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    phone: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: Spacing.half,
    },
    footer: {
      flexDirection: 'row',
      gap: Spacing.one,
    },
    button: {
      flex: 1,
    },
  });

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.contactName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{contact.contactName}</Text>
          <Text style={styles.phone}>{Formatting.phone(contact.contactPhone)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Call"
          onPress={onCall ?? (() => {})}
          variant="primary"
          size="small"
          style={styles.button}
        />
        <Button
          title="Message"
          onPress={onMessage ?? (() => {})}
          variant="secondary"
          size="small"
          style={styles.button}
        />
      </View>
    </Card>
  );
};
