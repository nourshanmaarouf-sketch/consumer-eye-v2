import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { C } from './theme';
import { Icon, Txt, Card, PrimaryButton, SecondaryButton, Field } from './components';
import { useStore, registerSupplier, addWholesale, num, fmt } from './store';

const EMPTY = { name: '', category: '', brand: '', barcode: '', unit: '', price: '', expiry: '' };

export default function WholesaleScreen() {
  const st = useStore();
  const [supName, setSupName] = useState('');
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [error, setError] = useState('');
  const up = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  if (!st.me.supplierName) {
    return (
      <View style={{ gap: 14 }}>
        <Card style={{ padding: 14 }}>
          <Txt style={s.title}>إدخال سجل تاجر جملة جديد</Txt>
          <Txt style={s.sub}>سجّل شركتك لتبدأ بإدخال أسعار الجملة</Txt>
        </Card>
        <Card>
          <Field label="اسم الشركة / المستودع" value={supName} onChangeText={setSupName} placeholder="مثال: شركة الفجر للتوزيع" />
          {error ? <Txt style={s.err}>{error}</Txt> : null}
          <PrimaryButton
            icon="warehouse"
            label="تسجيل المورد"
            onPress={() => (supName.trim().length < 2 ? setError('اكتب اسم الشركة') : registerSupplier(supName.trim()))}
          />
        </Card>
      </View>
    );
  }

  const submit = () => {
    if (f.name.trim().length < 2) return setError('اكتب اسم المادة');
    const p = num(f.price);
    if (!p || p <= 0) return setError('أدخل سعر جملة صحيحاً');
    addWholesale({ ...f, price: p });
    setF(EMPTY);
    setError('');
    setAdding(false);
  };

  return (
    <View style={{ gap: 14 }}>
      <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={s.iconBox}>
          <Icon name="warehouse" size={22} color={C.gold} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Txt style={s.title}>{st.me.supplierName}</Txt>
          <Txt style={s.sub}>الملف التعريفي للمورد</Txt>
        </View>
      </Card>

      {adding ? (
        <Card>
          <Txt style={s.title}>إضافة مادة جديدة</Txt>
          <Field label="اسم المادة" value={f.name} onChangeText={up('name')} placeholder="مثال: سكر أبيض" />
          <Field label="الصنف" value={f.category} onChangeText={up('category')} placeholder="مثال: مواد أساسية" />
          <Field label="الماركة" value={f.brand} onChangeText={up('brand')} />
          <Field label="الباركود" value={f.barcode} onChangeText={up('barcode')} keyboardType="numeric" />
          <Field label="العبوة" value={f.unit} onChangeText={up('unit')} placeholder="مثال: شوال 50 كغ" />
          <Field label="سعر الجملة (ل.س)" value={f.price} onChangeText={up('price')} keyboardType="numeric" />
          <Field label="تاريخ الصلاحية" value={f.expiry} onChangeText={up('expiry')} placeholder="2026/12/31" />
          {error ? <Txt style={s.err}>{error}</Txt> : null}
          <PrimaryButton icon="add-circle" label="حفظ المادة" onPress={submit} />
          <SecondaryButton icon="close" iconColor={C.g600} label="إلغاء" onPress={() => setAdding(false)} />
        </Card>
      ) : (
        <PrimaryButton icon="add-circle" label="إضافة مادة جديدة" onPress={() => setAdding(true)} style={{ borderRadius: 12, paddingVertical: 14 }} />
      )}

      {st.wholesale.length === 0 ? (
        <Card style={{ alignItems: 'center' }}>
          <Icon name="inventory-2" size={28} color={C.gold} />
          <Txt style={{ fontSize: 14, fontWeight: '700', color: '#000' }}>لا توجد مواد بعد</Txt>
          <Txt style={[s.sub, { textAlign: 'center' }]}>أضف أول مادة بسعر الجملة.</Txt>
        </Card>
      ) : (
        st.wholesale.map((w) => (
          <View key={w.id} style={s.itemCard}>
            <Txt style={{ fontWeight: '700', fontSize: 15, color: '#000' }}>{w.name}</Txt>
            <View style={s.grid}>
              <Pair label="الصنف" value={w.category} />
              <Pair label="الماركة" value={w.brand} />
              <Pair label="الباركود" value={w.barcode} />
              <Pair label="العبوة" value={w.unit} />
              <Pair label="سعر الجملة" value={fmt(w.price) + ' ل.س'} strong />
              <Pair label="تاريخ الصلاحية" value={w.expiry} />
            </View>
            <Txt style={s.sub}>{w.supplier} • آخر تحديث {w.updatedAt}</Txt>
          </View>
        ))
      )}
    </View>
  );
}

function Pair({ label, value, strong }) {
  return (
    <View style={{ width: '50%', paddingVertical: 4 }}>
      <Txt style={{ fontSize: 12, color: C.g600 }}>{label}</Txt>
      <Txt style={{ fontSize: 14, fontWeight: strong ? '700' : '500', color: '#000' }}>{value || '—'}</Txt>
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontWeight: '700', fontSize: 16, color: '#000' },
  sub: { fontSize: 12, color: C.g600 },
  err: { fontSize: 12, color: C.red600, fontWeight: '600' },
  iconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: C.dark, alignItems: 'center', justifyContent: 'center' },
  itemCard: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, gap: 8, elevation: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: C.bg, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: C.border },
});
