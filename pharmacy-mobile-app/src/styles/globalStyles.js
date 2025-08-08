// Consistent styling 
import { StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  screen: {
    flex: 1,
    padding: 16,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  textPrimary: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },

  textSecondary: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  textSmall: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  button: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },

  buttonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    marginVertical: 8,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },

  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 4,
  },

  successText: {
    color: COLORS.success,
    fontSize: 14,
    marginTop: 4,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.surface,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});