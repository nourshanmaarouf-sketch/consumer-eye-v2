import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { C, F } from './theme';
import { Icon, Txt, Card, Badge, PrimaryButton, SecondaryButton } from './components';
import { useStore, minMax, offersFor, addReport, fmt } from './store';

const CATEGORIES = ['نظافة وصحة', 'مادة منتهية الصلاحية', 'سعر مخالف', 'أخرى'];
const STEPS = ['تم الاستلام', 'قيد التدقيق', 'تنظيم الضبط'];

export function Timeline({ step }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {STEPS.map((t, i) => {
        const done = i <= step;
        return (
          <View key={t} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <View style={{ flex: 1, height: 2, backgroundColor: i === 0 ? 'transparent' : i <= step ? C.gold : C.g200 }} />
              <View style={[s.dot, done && { backgroundColor: C.gold, borderColor: C.gold }]}>
                {done ? <Icon name="check" size={14} color={C.dark} /> : null}
              </View>
              <View style={{ flex: 1, height: 2, backgroundColor: i === STEPS.length - 1 ? 'transparent' : i < step ? C.gold : C.g200 }} />
            </View>
            <Txt style={{ fontSize: 12, marginTop: 6, color: done ? C.text : C.g500, fontWeight: done ? '700' : '400' }}>{t}</Txt>
          </View>
        );
      })}
    </View>
  );
}

function ItemCard({ item, st, open, onToggle }) {
  const mm = minMax(st, item.id);
  const offers = open ? offersFor(st, item.id) : [];
  return (
    <View style={s.itemCard}>
      <Pressable onPress={onToggle} style={{ gap: 8 }}>
        <View style={s.rowBetween}>
          <View style={{ flexShrink: 1 }}>
            <Txt style={{ fontWeight: '700', fontSize: 15, color: '#000' }}>{item.name}</Txt>
            <Txt style={{ fontSize: 12, color: C.g600 }}>{item.unit} • {item.category}</Txt>
          </View>
          <Icon name={open ? 'expand-less' : 'expand-more'} size={24} color={C.gold} />
        </View>
        {mm ? (
          <View style={s.priceBox}>
            <View style={s.priceCell}>
              <Txt style={s.cellLabel}>أدنى سعر</Txt>
              <Txt style={[s.cellValue, { color: C.emerald700 }]}>{fmt(mm.min)} <Txt style={s.cur}>ل.س</Txt></Txt>
            </View>
            <View style={s.vline} />
            <View style={s.priceCell}>
              <Txt style={s.cellLabel}>أعلى سعر</Txt>
              <Txt style={[s.cellValue, { color: C.red600 }]}>{fmt(mm.max)} <Txt style={s.cur}>ل.س</Txt></Txt>
            </View>
          </View>
        ) : (
          <Txt style={{ fontSize: 12, color: C.g500 }}>لا توجد أسعار مسجلة بعد</Txt>
        )}
        {mm ? (
          <Txt style={{ fontSize: 12, color: C.g500 }}>آخر تحديث: {mm.updatedAt} • من {mm.count} منشآت</Txt>
        ) : null}
      </Pressable>

      {open ? (
        <View style={{ gap: 8, marginTop: 4 }}>
          <Txt style={{ fontWeight: '700', fontSize: 13, color: '#000' }}>المنشآت القريبة (من الأرخص)</Txt>
          {offers.map((o, i) => (
            <View key={o.shopId} style={s.shopRow}>
              <View style={{ flexShrink: 1 }}>
                <Txt style={{ fontWeight: '700', fontSize: 13, color: '#000' }}>{o.shop.name}</Txt>
                <Txt style={{ fontSize: 12, color: C.g600 }}>{o.shop.distance}</Txt>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Txt style={{ fontWeight: '700', fontSize: 14, color: '#000' }}>{fmt(o.price)} ل.س</Txt>
                {i === 0 ? <Badge bg={C.emerald50} color={C.emerald700} border={C.emerald200} size={12}>الأرخص</Badge> : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ReportForm({ st, onDone }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (shopName.trim().length < 2) {
      setError('اكتب اسم المنشأة');
      return;
    }
    if (description.trim().length < 5) {
      setError('اكتب وصفاً مختصراً للمخالفة');
      return;
    }
    const id = addReport({ category, shopName: shopName.trim(), description: description.trim() });
    onDone(id);
  };

  return (
    <View style={{ gap: 14 }}>
      <Card>
        <Txt style={s.h}>نوع البلاغ</Txt>
        <View style={s.chips}>
          {CATEGORIES.map((c) => (
            <Pressable key={c} onPress={() => setCategory(c)} style={[s.chip, c === category && s.chipOn]}>
              <Txt style={{ fontSize: 12, fontWeight: '600', color: c === category ? C.gold : C.g700 }}>{c}</Txt>
            </Pressable>
          ))}
        </View>

        <Txt style={s.h}>اسم المنشأة والحي</Txt>
        <TextInput
          value={shopName}
          onChangeText={setShopName}
          placeholder="مثال: ماركت السلام - شارع بغداد"
          placeholderTextColor={C.g400}
          style={s.field}
        />

        <Txt style={s.h}>وصف المخالفة</Txt>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="اكتب ما شاهدته..."
          placeholderTextColor={C.g400}
          style={s.textarea}
        />

        <View style={s.privacy}>
          <Icon name="visibility-off" size={16} color={C.dark} />
          <Txt style={{ fontSize: 12, color: C.g700, flex: 1 }}>هويتك مخفية عن المنشأة ولا تظهر إلا للمديرية.</Txt>
        </View>

        {error ? <Txt style={{ fontSize: 12, color: C.red600, fontWeight: '600' }}>{error}</Txt> : null}
        <PrimaryButton icon="send" label="إرسال البلاغ" onPress={submit} />
        <SecondaryButton icon="close" iconColor={C.g600} label="إلغاء" onPress={() => onDone(null)} />
      </Card>
    </View>
  );
}

export default function CitizenScreen() {
  const st = useStore();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [view, setView] = useState('main');
  const [lastTracking, setLastTracking] = useState(null);

  const q = query.trim();
  const items = st.items.filter((it) => !q || it.name.includes(q) || (it.barcode && it.barcode.includes(q)));

  if (view === 'report') {
    return (
      <View style={{ gap: 14 }}>
        <Card style={{ padding: 14 }}>
          <Txt style={{ fontWeight: '700', fontSize: 16, color: '#000' }}>تقديم شكوى</Txt>
          <Txt style={{ fontSize: 12, color: C.g600 }}>يُسجل البلاغ فوراً ويُحال إلى دائرة الرقابة</Txt>
        </Card>
        <ReportForm
          st={st}
          onDone={(id) => {
            if (id) setLastTracking(id);
            setView('main');
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      <Card style={{ padding: 14 }}>
        <Txt style={{ fontWeight: '700', fontSize: 16, color: '#000' }}>دليل الأسعار</Txt>
        <Txt style={{ fontSize: 12, color: C.g600 }}>ابحث بالاسم أو اكتب رقم الباركود</Txt>
      </Card>

      <View style={{ justifyContent: 'center' }}>
        <View style={s.abs}>
          <Icon name="search" size={20} color={C.gold} />
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="اسم المادة أو الباركود..."
          placeholderTextColor={C.g400}
          style={s.searchInput}
        />
      </View>

      {lastTracking ? (
        <View style={s.success}>
          <Icon name="check-circle" size={20} color={C.emerald700} />
          <Txt style={{ fontSize: 13, color: C.emerald800, flex: 1, fontWeight: '600' }}>
            تم استلام بلاغك. رقم المتابعة: {lastTracking}
          </Txt>
        </View>
      ) : null}

      {items.length === 0 ? (
        <Card style={{ alignItems: 'center' }}>
          <Icon name={st.items.length === 0 ? 'inventory-2' : 'search-off'} size={28} color={C.gold} />
          <Txt style={{ fontSize: 14, fontWeight: '700', color: '#000', textAlign: 'center' }}>
            {st.items.length === 0 ? 'لا توجد مواد مسجلة بعد' : 'لا توجد مادة بهذا الاسم أو الباركود'}
          </Txt>
          {st.items.length === 0 ? (
            <Txt style={{ fontSize: 12, color: C.g600, textAlign: 'center' }}>
              تظهر هنا المواد والأسعار فور إدخالها من التجار.
            </Txt>
          ) : null}
        </Card>
      ) : (
        items.map((it) => (
          <ItemCard key={it.id} item={it} st={st} open={openId === it.id} onToggle={() => setOpenId(openId === it.id ? null : it.id)} />
        ))
      )}

      <Pressable onPress={() => setView('report')} style={({ pressed }) => [s.reportBtn, pressed && { opacity: 0.85 }]}>
        <Icon name="campaign" size={22} color={C.gold} />
        <View style={{ flex: 1 }}>
          <Txt style={{ color: C.gold, fontWeight: '700', fontSize: 14 }}>تقديم شكوى صحية</Txt>
          <Txt style={{ color: '#ffffff', fontSize: 12, opacity: 0.85 }}>بلاغ فوري مع رقم متابعة</Txt>
        </View>
        <Icon name="arrow-back" size={18} color={C.gold} />
      </Pressable>

      {st.reports.length > 0 ? (
        <View style={{ gap: 10 }}>
          <Txt style={{ fontWeight: '700', fontSize: 15, color: '#000' }}>بلاغاتي</Txt>
          {st.reports.map((r) => (
            <Card key={r.id} style={{ gap: 12 }}>
              <View style={s.rowBetween}>
                <Txt style={{ fontWeight: '700', fontSize: 14, color: '#000' }}>{r.id}</Txt>
                <Txt style={{ fontSize: 12, color: C.g600 }}>{r.date}</Txt>
              </View>
              <Txt style={{ fontSize: 13, color: C.g700 }}>{r.category} • {r.shopName}</Txt>
              <Timeline step={r.step} />
            </Card>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  h: { fontWeight: '700', fontSize: 14, color: '#000' },
  abs: { position: 'absolute', zIndex: 1, start: 12 },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingStart: 42,
    paddingEnd: 14,
    fontSize: 14,
    color: C.g800,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: F.regular,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
    elevation: 1,
  },
  priceBox: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: C.border },
  priceCell: { flex: 1, alignItems: 'center' },
  vline: { width: 1, backgroundColor: C.border },
  cellLabel: { fontSize: 12, color: C.g600 },
  cellValue: { fontSize: 18, fontWeight: '700' },
  cur: { fontSize: 12, fontWeight: '400', color: C.g600 },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.g200, backgroundColor: '#fff' },
  chipOn: { backgroundColor: C.dark, borderColor: C.dark },
  shopPick: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.g200,
    backgroundColor: '#fff',
  },
  field: {
    backgroundColor: C.g50,
    borderWidth: 1,
    borderColor: C.g200,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: C.g800,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: F.regular,
  },
  textarea: {
    minHeight: 90,
    backgroundColor: C.g50,
    borderWidth: 1,
    borderColor: C.g200,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: C.g800,
    textAlign: 'right',
    textAlignVertical: 'top',
    writingDirection: 'rtl',
    fontFamily: F.regular,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.goldSoft,
    padding: 10,
    borderRadius: 10,
  },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.emerald50,
    borderWidth: 1,
    borderColor: C.emerald200,
    padding: 12,
    borderRadius: 12,
  },
  reportBtn: {
    backgroundColor: C.dark,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.gold,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.g300,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
