import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { C } from './theme';
import { Icon, Txt, Card, PrimaryButton, SecondaryButton } from './components';
import { Timeline } from './CitizenScreen';
import { useStore, series, advanceReport, fmt } from './store';

const RANGES = [
  { key: 'week', label: 'أسبوع' },
  { key: 'month', label: 'شهر' },
  { key: 'year', label: 'سنة' },
];

function Chart({ data }) {
  const W = 320, H = 120, pad = 14;
  const vals = data.flatMap((d) => (d ? [d.min, d.max] : []));
  if (!vals.length) return null;
  const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1;
  const n = data.length;
  // الأقدم يميناً والأحدث يساراً (اتجاه القراءة العربي)
  const x = (i) => W - pad - (n === 1 ? 0 : (i * (W - 2 * pad)) / (n - 1));
  const y = (v) => H - pad - ((v - lo) / span) * (H - 2 * pad);
  const path = (key) => {
    let d = '';
    let prev = false;
    data.forEach((p, i) => {
      if (!p) { prev = false; return; }
      d += `${prev ? 'L' : 'M'} ${x(i)} ${y(p[key])} `;
      prev = true;
    });
    return d;
  };
  const lastIdx = data.map((p) => !!p).lastIndexOf(true);
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      <Line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#E5E7EB" strokeWidth="1" />
      <Path d={path('max')} fill="none" stroke="#0D231D" strokeWidth="2.5" />
      <Path d={path('min')} fill="none" stroke="#C5A059" strokeWidth="2.5" />
      {lastIdx >= 0 ? (
        <>
          <Circle cx={x(lastIdx)} cy={y(data[lastIdx].max)} r="4" fill="#0D231D" />
          <Circle cx={x(lastIdx)} cy={y(data[lastIdx].min)} r="4" fill="#C5A059" />
        </>
      ) : null}
    </Svg>
  );
}

function Stat({ label, value, icon }) {
  return (
    <View style={s.statCard}>
      <View style={s.rowBetween}>
        <Txt style={{ fontSize: 13, color: C.g700, flexShrink: 1 }}>{label}</Txt>
        <Icon name={icon} size={20} color={C.gold} />
      </View>
      <Txt style={{ fontSize: 36, fontWeight: '700', color: '#000', lineHeight: 46 }}>{value}</Txt>
    </View>
  );
}

export default function SupervisionScreen() {
  const st = useStore();
  const [range, setRange] = useState('week');
  const [itemId, setItemId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const activeReports = st.reports.filter((r) => r.step < 2).length;
  const done = st.reports.filter((r) => r.step === 2);
  const violating = new Set(done.map((r) => r.shopName)).size;

  const selected = st.items.find((i) => i.id === itemId) || st.items[0];
  const data = selected ? series(st, selected.id, range) : [];
  const has = data.some(Boolean);
  const last = [...data].reverse().find(Boolean);

  return (
    <View style={{ gap: 16 }}>
      <View style={s.banner}>
        <Txt style={{ color: C.gold, fontWeight: '700', fontSize: 16 }}>لوحة الرقابة التموينية</Txt>
        <Txt style={{ color: '#fff', fontSize: 12, opacity: 0.85 }}>مديرية التجارة الداخلية وحماية المستهلك – اللاذقية</Txt>
      </View>

      <View style={s.statsGrid}>
        <Stat label="البلاغات النشطة" value={activeReports} icon="campaign" />
        <Stat label="المنشآت المخالفة" value={violating} icon="gavel" />
        <Stat label="المنشآت المسجلة" value={st.shops.length} icon="storefront" />
        <Stat label="المواد المسجلة" value={st.items.length} icon="inventory-2" />
      </View>

      <Card style={{ gap: 12 }}>
        <Txt style={s.h}>تطور الأسعار</Txt>
        {st.items.length === 0 ? (
          <Txt style={{ fontSize: 13, color: C.g600 }}>لا توجد مواد بعد. تظهر المخططات حين يدخل التجار الأسعار.</Txt>
        ) : (
          <>
            <View style={s.chips}>
              {st.items.map((it) => (
                <Pressable key={it.id} onPress={() => setItemId(it.id)} style={[s.chip, selected && it.id === selected.id && s.chipOn]}>
                  <Txt style={{ fontSize: 12, fontWeight: '600', color: selected && it.id === selected.id ? C.gold : C.g700 }}>{it.name}</Txt>
                </Pressable>
              ))}
            </View>
            <View style={s.rangeWrap}>
              {RANGES.map((r) => (
                <Pressable key={r.key} onPress={() => setRange(r.key)} style={[s.rangeBtn, range === r.key && { backgroundColor: C.dark }]}>
                  <Txt style={{ fontSize: 13, fontWeight: '600', color: range === r.key ? C.gold : C.g700 }}>{r.label}</Txt>
                </Pressable>
              ))}
            </View>
            {has ? (
              <>
                <View style={s.chartBox}>
                  <Chart data={data} />
                </View>
                <View style={s.rowBetween}>
                  <Txt style={{ fontSize: 12, color: C.g600 }}>الأقدم يميناً • الأحدث يساراً</Txt>
                  <Txt style={{ fontSize: 12, color: C.g700 }}>
                    الآن: {fmt(last.min)} – {fmt(last.max)} ل.س
                  </Txt>
                </View>
                <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
                  <View style={s.legend}><View style={[s.dot, { backgroundColor: C.dark }]} /><Txt style={{ fontSize: 12, color: C.g700 }}>أعلى سعر</Txt></View>
                  <View style={s.legend}><View style={[s.dot, { backgroundColor: C.gold }]} /><Txt style={{ fontSize: 12, color: C.g700 }}>أدنى سعر</Txt></View>
                </View>
              </>
            ) : (
              <Txt style={{ fontSize: 13, color: C.g600 }}>لا أسعار مسجلة لهذه المادة بعد.</Txt>
            )}
          </>
        )}
      </Card>

      <Card style={{ gap: 12 }}>
        <Txt style={s.h}>البلاغات الواردة</Txt>
        {st.reports.length === 0 ? (
          <Txt style={{ fontSize: 13, color: C.g600 }}>لا توجد بلاغات حالياً.</Txt>
        ) : (
          st.reports.map((r) => (
            <View key={r.id} style={s.report}>
              <View style={s.rowBetween}>
                <Txt style={{ fontWeight: '700', fontSize: 14, color: '#000' }}>{r.shopName}</Txt>
                <Txt style={{ fontSize: 12, color: C.g600 }}>{r.id}</Txt>
              </View>
              <Txt style={{ fontSize: 13, color: C.g700 }}>{r.category}: {r.description}</Txt>
              <Timeline step={r.step} />
              {(r.log || []).map((l, i) => (
                <Txt key={i} style={{ fontSize: 12, color: C.g600 }}>• {l}</Txt>
              ))}
              {r.step < 2 ? (
                confirmId === r.id ? (
                  <View style={s.confirm}>
                    <Txt style={{ fontSize: 13, fontWeight: '700', color: '#000' }}>
                      {r.step === 0 ? 'بدء التدقيق على هذا البلاغ؟' : 'تأكيد تنظيم ضبط رقمي بحق المنشأة؟'}
                    </Txt>
                    <Txt style={{ fontSize: 12, color: C.g700 }}>{r.shopName}</Txt>
                    <Txt style={{ fontSize: 12, color: C.g600 }}>سيُسجّل الإجراء مع التاريخ والوقت.</Txt>
                    <PrimaryButton
                      label="تأكيد"
                      onPress={() => {
                        advanceReport(r.id);
                        setConfirmId(null);
                      }}
                    />
                    <SecondaryButton label="إلغاء" iconColor={C.g600} onPress={() => setConfirmId(null)} />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setConfirmId(r.id)}
                    style={[s.actionBtn, r.step === 1 && { backgroundColor: C.red, borderColor: C.red }]}
                  >
                    <Txt style={{ fontWeight: '700', fontSize: 13, color: r.step === 1 ? '#fff' : C.gold }}>
                      {r.step === 0 ? 'بدء التدقيق' : 'تنظيم ضبط رقمي'}
                    </Txt>
                  </Pressable>
                )
              ) : null}
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  h: { fontWeight: '700', fontSize: 16, color: '#000' },
  banner: { backgroundColor: C.dark, borderRadius: 12, padding: 16, gap: 2, borderWidth: 1, borderColor: C.gold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flexBasis: '47%', flexGrow: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, elevation: 1, gap: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.g200, backgroundColor: '#fff' },
  chipOn: { backgroundColor: C.dark, borderColor: C.dark },
  rangeWrap: { flexDirection: 'row', backgroundColor: C.g100, borderRadius: 10, padding: 3, alignSelf: 'flex-start' },
  rangeBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  chartBox: { width: '100%', height: 150, backgroundColor: C.g50, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: C.border },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  report: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, gap: 10 },
  confirm: { backgroundColor: C.goldSoft, borderRadius: 10, padding: 12, gap: 8 },
  actionBtn: { backgroundColor: C.dark, borderWidth: 1, borderColor: C.gold, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
});
