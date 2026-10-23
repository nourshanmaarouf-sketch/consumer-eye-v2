import React, { useState } from 'react';
import { View, TextInput, Pressable, Linking, StyleSheet } from 'react-native';
import { C, F } from './theme';
import { Icon, Txt, Card, PrimaryButton, SecondaryButton } from './components';

const ROLES = [
  { key: 'citizen', title: 'خدمة المواطن', sub: 'استعلام البورصة والشكاوى', icon: 'support-agent' },
  { key: 'retail', title: 'تاجر تجزئة', sub: 'لوائح الأسعار اليومية', icon: 'storefront' },
  { key: 'wholesale', title: 'مورد / تاجر جملة', sub: 'فواتير وتدفق التوريد', icon: 'inventory-2' },
  { key: 'supervision', title: 'الرقابة التموينية', sub: 'الضبوط والمطابقة الميدانية', icon: 'verified-user' },
];

export default function LoginScreen({ onLogin, onCitizenEntry }) {
  const [role, setRole] = useState('citizen');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [keep, setKeep] = useState(true);
  const [error, setError] = useState('');

  const submit = () => {
    if (!/^09\d{8}$/.test(phone.trim())) {
      setError('رقم الهاتف غير صحيح. مثال: 0912345678');
      return;
    }
    if (password.length < 4) {
      setError('الرمز السري يجب ألا يقل عن 4 أحرف');
      return;
    }
    setError('');
    onLogin(role);
  };

  const current = ROLES.find((r) => r.key === role);

  return (
    <View style={{ gap: 16 }}>
      {/* حدد صفة الاستخدام */}
      <View style={{ gap: 8 }}>
        <View style={s.rowBetween}>
          <View style={s.rowGap6}>
            <Icon name="badge" size={20} color={C.green} />
            <Txt style={{ fontWeight: '700', fontSize: 14, color: C.dark }}>حدد صفة الاستخدام</Txt>
          </View>
          <View style={s.roleBadge}>
            <Txt style={{ fontSize: 11, color: C.green, fontWeight: '600' }}>
              محدد: {current.title}
            </Txt>
          </View>
        </View>

        <View style={s.rolesGrid}>
          {ROLES.map((r) => {
            const on = r.key === role;
            return (
              <Pressable
                key={r.key}
                onPress={() => setRole(r.key)}
                style={[s.roleCard, on ? s.roleOn : s.roleOff]}
              >
                <View style={s.rowBetween}>
                  {on ? <Icon name="check-circle" size={20} color={C.accent} /> : <View style={{ width: 20 }} />}
                  <Icon name={r.icon} size={24} color={on ? '#ffffff' : C.green} />
                </View>
                <View style={{ marginTop: 12 }}>
                  <Txt style={{ fontWeight: '700', fontSize: 13, color: on ? '#ffffff' : C.g900 }}>
                    {r.title}
                  </Txt>
                  <Txt
                    style={{
                      fontSize: 10,
                      marginTop: 2,
                      color: on ? 'rgba(255,255,255,0.8)' : C.g500,
                    }}
                  >
                    {r.sub}
                  </Txt>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* نموذج الدخول */}
      <Card>
        <View style={{ gap: 4 }}>
          <View style={s.rowBetween}>
            <Txt style={s.label}>رقم الهاتف المحمول</Txt>
            <Txt style={{ fontSize: 10, color: C.g400 }}>إلزامي وموثق</Txt>
          </View>
          <View style={s.inputBox}>
            <Icon name="phone-iphone" size={20} color={C.g400} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="أدخل رقم الهاتف المحمول (مثال: 09XXXXXXXX)"
              placeholderTextColor={C.g400}
              style={[s.input, { textAlign: 'left', writingDirection: 'ltr' }]}
            />
            <Icon name="contact-phone" size={18} color={C.g400} />
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <View style={s.rowBetween}>
            <Txt style={s.label}>كلمة المرور / الرمز السري</Txt>
            <Txt style={{ fontSize: 10, color: C.green }}>استعادة الرمز السري؟</Txt>
          </View>
          <View style={s.inputBox}>
            <Pressable onPress={() => setShowPass((v) => !v)} hitSlop={8}>
              <Icon name={showPass ? 'visibility-off' : 'visibility'} size={18} color={C.g400} />
            </Pressable>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              placeholder="••••••••••••"
              placeholderTextColor={C.g400}
              style={[s.input, { textAlign: 'left', writingDirection: 'ltr', letterSpacing: 1 }]}
            />
            <Icon name="lock" size={18} color={C.g400} />
          </View>
        </View>

        <Pressable onPress={() => setKeep((v) => !v)} style={s.rowGap8}>
          <View style={[s.checkbox, keep && { backgroundColor: C.dark, borderColor: C.dark }]}>
            {keep ? <Icon name="check" size={13} color="#ffffff" /> : null}
          </View>
          <Txt style={{ fontSize: 11, color: C.g600 }}>إبقاء الجلسة نشطة وموثقة على هذا الجهاز</Txt>
        </Pressable>

        {error ? (
          <Txt style={{ fontSize: 12, color: C.red600, fontWeight: '600' }}>{error}</Txt>
        ) : null}

        <PrimaryButton icon="login" label="تسجيل الدخول إلى المنظومة" onPress={submit} />

        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Txt style={{ fontSize: 10, color: C.g400, paddingHorizontal: 12 }}>أو خيارات الوصول السريع</Txt>
          <View style={s.dividerLine} />
        </View>

        <SecondaryButton
          icon="menu-book"
          label="دخول حر للمواطنين (تصفح دليل النشرات التموينية فقط)"
          onPress={onCitizenEntry}
        />
      </Card>

      {/* غرفة العمليات */}
      <Card style={{ padding: 14 }}>
        <View style={s.rowBetween}>
          <View style={{ flexShrink: 1, paddingEnd: 8 }}>
            <Txt style={{ fontWeight: '700', fontSize: 12, color: C.dark }}>
              غرفة العمليات المركزية والدعم الفني
            </Txt>
            <Txt style={{ fontSize: 10, color: C.g500 }}>
              جاهزية على مدار 24 ساعة لبلاغات وشكاوى الأسواق
            </Txt>
          </View>
          <Pressable onPress={() => Linking.openURL('tel:119')} style={s.callBtn}>
            <Icon name="call" size={16} color={C.gold} />
            <Txt style={{ color: C.gold, fontSize: 12, fontWeight: '700' }}>119</Txt>
          </Pressable>
        </View>
      </Card>

      {/* ملاحظة قانونية */}
      <View style={s.legal}>
        <Icon name="gavel" size={18} color={C.g500} />
        <Txt style={{ fontSize: 10, color: C.g600, lineHeight: 15, flex: 1 }}>
          يخضع استخدام هذه المنظومة لأحكام قانون التجارة الداخلية وحماية المستهلك رقم (8) لعام 2021 وتعديلاته.
        </Txt>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowGap6: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowGap8: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleBadge: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 88,
    padding: 14,
    borderRadius: 8,
    justifyContent: 'space-between',
    elevation: 1,
  },
  roleOn: { backgroundColor: C.dark, borderWidth: 2, borderColor: C.dark },
  roleOff: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: C.g200 },
  label: { fontSize: 12, fontWeight: '600', color: C.g700 },
  inputBox: {
    backgroundColor: C.g50,
    borderWidth: 1,
    borderColor: C.g200,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: { flex: 1, fontSize: 12, color: C.g800, paddingVertical: 8, fontFamily: F.regular },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.g300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.g200 },
  callBtn: {
    backgroundColor: C.dark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legal: {
    backgroundColor: C.g50,
    borderWidth: 1,
    borderColor: C.g200,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
});
