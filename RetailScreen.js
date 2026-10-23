import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { C, F } from './theme';
import { Icon, Txt, Card, PrimaryButton, SecondaryButton, Field } from './components';
import { useStore, registerRetail, addItem, setPrice, currentPrice, num, fmt } from './store';

function Register() {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    if (name.trim().length < 2) return setError('اكتب اسم المنشأة');
    registerRetail({ name: name.trim(), area: area.trim() });
  };
  return (
    <View style={{ gap: 14 }}>
      <Card style={{ padding: 14 }}>
        <Txt style={s.title}>إدخال تاجر تجزئة جديد</Txt>
        <Txt style={s.sub}>سجّل منشأتك لتبدأ بإدخال الأسعار</Txt>
      </Card>
      <Card>
        <Field label="اسم المنشأة" value={name} onChangeText={setName} placeholder="مثال: ماركت العثمان" />
        <Field label="الحي / المسافة التقريبية" value={area} onChangeText={setArea} placeholder="مثال: الشيخ ضاهر" />
        {error ? <Txt style={s.err}>{error}</Txt> : null}
        <PrimaryButton icon="storefront" label="تسجيل المنشأة" onPress={submit} />
      </Card>
    </View>
  );
}

function PriceRow({ item, shop, st }) {
  const cur = currentPrice(st, item.id, shop.id);
  const [val, setVal] = useState(cur ? String(cur.price) : '');
  const [msg, setMsg] = useState('');
  const save = () => {
    const n = num(val);
    if (!n || n <= 0) return setMsg('أدخل سعراً صحيحاً');
    setPrice(item.id, shop.id, n);
    setMsg('تم الحفظ');
  };
  return (
    <View style={s.itemCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flexShrink: 1 }}>
          <Txt style={{ fontWeight: '700', fontSize: 15, color: '#000' }}>{item.name}</Txt>
          <Txt style={s.sub}>{[item.unit, item.category].filter(Boolean).join(' • ')}</Txt>
          {item.barcode ? <Txt style={s.sub}>الباركود: {item.barcode}</Txt> : null}
        </View>
        {cur ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Txt style={{ fontWeight: '700', fontSize: 16, color: '#000' }}>{fmt(cur.price)}</Txt>
            <Txt style={s.sub}>{cur.updatedAt}</Txt>
          </View>
        ) : (
          <Txt style={s.sub}>لا سعر بعد</Txt>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <TextInput
          value={val}
          onChangeText={(t) => {
            setVal(t);
            setMsg('');
          }}
          keyboardType="numeric"
          placeholder="السعر بالليرة"
          placeholderTextColor={C.g400}
          style={s.priceInput}
        />
        <View style={{ width: 110 }}>
          <PrimaryButton label="حفظ السعر" size={13} onPress={save} />
        </View>
      </View>
      {msg ? <Txt style={{ fontSize: 12, color: msg === 'تم الحفظ' ? C.emerald700 : C.red600, fontWeight: '600' }}>{msg}</Txt> : null}
    </View>
  );
}

export default function RetailScreen() {
  const st = useStore();
  const shop = st.shops.find((x) => x.id === st.me.retailShopId);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: '', unit: '', category: '', barcode: '' });
  const [error, setError] = useState('');
  const up = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  if (!shop) return <Register />;

  const submit = () => {
    if (f.name.trim().length < 2) return setError('اكتب اسم المادة');
    addItem({ name: f.name.trim(), unit: f.unit.trim(), category: f.category.trim(), barcode: f.barcode.trim() });
    setF({ name: '', unit: '', category: '', barcode: '' });
    setError('');
    setAdding(false);
  };

  return (
    <View style={{ gap: 14 }}>
      <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={s.iconBox}>
          <Icon name="storefront" size={22} color={C.gold} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Txt style={s.title}>{shop.name}</Txt>
          <Txt style={s.sub}>{shop.distance ? shop.distance + ' • ' : ''}منشأة تجزئة مسجلة</Txt>
        </View>
      </Card>

      {adding ? (
        <Card>
          <Txt style={s.title}>إضافة مادة جديدة</Txt>
          <Field label="اسم المادة" value={f.name} onChangeText={up('name')} placeholder="مثال: سكر أبيض" />
          <Field label="العبوة" value={f.unit} onChangeText={up('unit')} placeholder="مثال: 1 كغ" />
          <Field label="الصنف" value={f.category} onChangeText={up('category')} placeholder="مثال: مواد أساسية" />
          <Field label="الباركود (إن وُجد)" value={f.barcode} onChangeText={up('barcode')} keyboardType="numeric" />
          {error ? <Txt style={s.err}>{error}</Txt> : null}
          <PrimaryButton icon="add-circle" label="حفظ المادة" onPress={submit} />
          <SecondaryButton icon="close" iconColor={C.g600} label="إلغاء" onPress={() => setAdding(false)} />
        </Card>
      ) : (
        <PrimaryButton icon="add-circle" label="إضافة مادة جديدة" onPress={() => setAdding(true)} style={{ borderRadius: 12, paddingVertical: 14 }} />
      )}

      {st.items.length === 0 ? (
        <Card style={{ alignItems: 'center' }}>
          <Icon name="inventory-2" size={28} color={C.gold} />
          <Txt style={{ fontSize: 14, fontWeight: '700', color: '#000' }}>لا توجد مواد بعد</Txt>
          <Txt style={[s.sub, { textAlign: 'center' }]}>أضف أول مادة ثم أدخل سعرها.</Txt>
        </Card>
      ) : (
        st.items.map((it) => <PriceRow key={it.id} item={it} shop={shop} st={st} />)
      )}
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontWeight: '700', fontSize: 16, color: '#000' },
  sub: { fontSize: 12, color: C.g600 },
  err: { fontSize: 12, color: C.red600, fontWeight: '600' },
  iconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: C.dark, alignItems: 'center', justifyContent: 'center' },
  itemCard: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, gap: 10, elevation: 1 },
  priceInput: {
    flex: 1,
    backgroundColor: C.g50,
    borderWidth: 1,
    borderColor: C.g200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'right',
    fontFamily: F.bold,
  },
});
