import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './button';
import { Colors, Spacing } from '@/constants/theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const styles = StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.three,
          backgroundColor: Colors.light.background,
        },
        title: {
          fontSize: 20,
          fontWeight: 'bold',
          color: Colors.light.text,
          marginBottom: Spacing.two,
          textAlign: 'center',
        },
        message: {
          fontSize: 14,
          color: Colors.light.textSecondary,
          marginBottom: Spacing.three,
          textAlign: 'center',
        },
        errorText: {
          fontSize: 12,
          color: '#FF3B30',
          backgroundColor: Colors.light.backgroundElement,
          padding: Spacing.two,
          borderRadius: 8,
          marginBottom: Spacing.three,
          maxHeight: 150,
        },
      });

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>An unexpected error occurred. Please try again.</Text>
          {this.state.error && (
            <Text style={styles.errorText}>{this.state.error.toString()}</Text>
          )}
          <Button
            title="Try Again"
            onPress={this.resetError}
            variant="primary"
          />
        </View>
      );
    }

    return this.props.children;
  }
}
