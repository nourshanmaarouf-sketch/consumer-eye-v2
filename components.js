import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Pressable,
  ScrollView,
  TextInput,
  I18nManager,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { C, F, shadow, fontFor } from './theme';
import { LOGO_URI } from './logo';

/* ---------- أيقونة (مع بديل آمن إن لم يوجد الاسم) ---------- */
export function Icon({ name, size = 20, color = C.g500, style }) {
  const known = MaterialIcons.glyphMap && MaterialIcons.glyphMap[name];
  return (
    <MaterialIcons
      name={known ? name : 'help-outline'}
      size={size}
      color={color}
      style={style}
    />
  );
}

/* ---------- نص عربي RTL ---------- */
export function Txt({ style, children, ...rest }) {
  const flat = StyleSheet.flatten([styles.txt, style]) || {};
  const { fontWeight, ...others } = flat;
  return (
    <Text {...rest} style={[others, { fontFamily: fontFor(fontWeight) }]}>
      {children}
    </Text>
  );
}

/* ---------- نقطة نابضة (الحالة المباشرة) ---------- */
export function PulseDot({ color = C.accent, size = 8 }) {
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 0.45, duration: 1000, useNativeDriver: true }),
        Animated.timing(a, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: a,
      }}
    />
  );
}

/* ---------- الترويسة الحكومية الموحدة ---------- */
export function GovHeader({ subtitle, topInset = 0, onLogout }) {
  return (
    <View style={styles.header}>
      <View style={[styles.headerTop, { paddingTop: 12 + topInset }]}>
        <View style={styles.brandWrap}>
          <View style={styles.emblemBox}>
            <Image source={{ uri: LOGO_URI }} style={styles.emblem} resizeMode="contain" />
          </View>
          <View style={styles.titleGroup}>
            <Txt style={styles.republic}>الجمهورية العربية السورية</Txt>
            <Txt style={styles.ministry}>وزارة الاقتصاد والصناعة</Txt>
            <Txt style={styles.directorate}>
              مديرية التجارة الداخلية وحماية المستهلك في اللاذقية
            </Txt>
          </View>
        </View>
        {onLogout ? (
          <Pressable onPress={onLogout} style={styles.userIcon} hitSlop={8}>
            <Icon name="logout" size={20} color={C.gold} />
          </Pressable>
        ) : (
          <View style={styles.userIcon}>
            <Icon name="person" size={20} color={C.gold} />
          </View>
        )}
      </View>
      <View style={styles.headerBottom}>
        <View style={styles.headerBottomInner}>
          <View style={styles.liveRow}>
            <PulseDot />
            <Txt style={styles.liveText}>عين المستهلك - محافظة اللاذقية</Txt>
          </View>
          <Txt style={styles.subtitle}>{subtitle}</Txt>
        </View>
      </View>
    </View>
  );
}

/* ---------- شريط التنقل السفلي ---------- */
const TABS = {
  citizen: { key: 'citizen', label: 'الرئيسية', icon: 'home' },
  retail: { key: 'retail', label: 'أسعار التجزئة', icon: 'shopping-bag' },
  wholesale: { key: 'wholesale', label: 'أسعار الجملة', icon: 'store' },
  supervision: { key: 'supervision', label: 'المراقبة والإشراف', icon: 'verified-user' },
};

// كل صفة ترى شاشاتها فقط
export const ROLE_TABS = {
  citizen: ['citizen'],
  retail: ['retail'],
  wholesale: ['wholesale'],
  supervision: ['supervision'],
};

export function BottomNav({ tabs, active, onChange, bottomInset = 0 }) {
  return (
    <View style={[styles.nav, { height: 68 + bottomInset, paddingBottom: bottomInset }]}>
      {tabs.map((k) => {
        const t = TABS[k];
        const on = t.key === active;
        return (
          <Pressable key={t.key} onPress={() => onChange(t.key)} style={styles.navBtn}>
            <View style={[styles.navBar, on && { backgroundColor: C.gold }]} />
            <Icon name={t.icon} size={22} color={on ? C.dark : C.g500} />
            <Txt
              style={{
                fontSize: 11,
                marginTop: 2,
                color: on ? C.dark : C.g500,
                fontWeight: on ? '700' : '500',
              }}
            >
              {t.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- بطاقة بيضاء ---------- */
export function Card({ style, children }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/* ---------- شارة صغيرة ---------- */
export function Badge({ bg, color, border, size = 10, icon, children, style }) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        border ? { borderWidth: 1, borderColor: border } : null,
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={13} color={color} /> : null}
      <Txt style={{ color, fontSize: size, fontWeight: '700' }}>{children}</Txt>
    </View>
  );
}

/* ---------- أزرار ---------- */
export function PrimaryButton({ icon, label, onPress, size = 14, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btnPrimary,
        pressed && { backgroundColor: C.dark2 },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={C.gold} /> : null}
      <Txt style={{ color: C.gold, fontWeight: '700', fontSize: size, textAlign: 'center', flexShrink: 1 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function SecondaryButton({ icon, iconColor = C.green, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btnSecondary, pressed && { backgroundColor: C.g100 }]}
    >
      {icon ? <Icon name={icon} size={18} color={iconColor} /> : null}
      <Txt style={{ color: C.g800, fontWeight: '600', fontSize: 12, textAlign: 'center', flexShrink: 1 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

/* ---------- حقل إدخال موحّد ---------- */
export function Field({ label, value, onChangeText, placeholder, keyboardType, multiline, hint }) {
  return (
    <View style={{ gap: 4 }}>
      <Txt style={{ fontSize: 13, fontWeight: '600', color: C.g800 }}>{label}</Txt>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.g400}
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
          backgroundColor: C.g50,
          borderWidth: 1,
          borderColor: C.g200,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          color: C.g800,
          textAlign: 'right',
          writingDirection: 'rtl',
          fontFamily: F.regular,
          minHeight: multiline ? 80 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {hint ? <Txt style={{ fontSize: 12, color: C.g500 }}>{hint}</Txt> : null}
    </View>
  );
}

/* ---------- شريط أفقي RTL (يبدأ من اليمين) ---------- */
export function RtlHScroll({ children, contentContainerStyle }) {
  const ref = useRef(null);
  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      onContentSizeChange={() => {
        if (!I18nManager.isRTL && ref.current) {
          ref.current.scrollToEnd({ animated: false });
        }
      }}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  txt: { color: C.text, writingDirection: 'rtl' },

  header: {
    backgroundColor: C.dark,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  headerTop: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.dark2,
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  emblemBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblem: { width: 36, height: 36, borderRadius: 8 },
  titleGroup: { flexShrink: 1 },
  republic: { fontSize: 11, color: C.mint, lineHeight: 17 },
  ministry: { fontSize: 14.5, fontWeight: '700', color: '#ffffff', lineHeight: 23, marginTop: 2 },
  directorate: { fontSize: 11, color: C.mint2, opacity: 0.9, lineHeight: 18, marginTop: 2 },
  userIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(197,160,89,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBottom: { backgroundColor: C.darker, paddingHorizontal: 16, paddingVertical: 6 },
  headerBottomInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveText: { fontSize: 11, color: C.mint, fontWeight: '700' },
  subtitle: { fontSize: 11, color: C.mint, opacity: 0.8 },

  nav: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: C.g200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  navBtn: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 },
  navBar: { width: 28, height: 3, borderRadius: 2, backgroundColor: 'transparent', marginBottom: 4 },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 14,
    ...shadow,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: C.dark,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: C.g50,
    borderWidth: 1,
    borderColor: C.g200,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
