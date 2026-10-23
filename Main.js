import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StatusBar, BackHandler } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from '@expo-google-fonts/tajawal';

import { C } from './theme';
import { GovHeader, BottomNav, ROLE_TABS, Icon, Txt } from './components';
import LoginScreen from './LoginScreen';
import RetailScreen from './RetailScreen';
import WholesaleScreen from './WholesaleScreen';
import CitizenScreen from './CitizenScreen';
import SupervisionScreen from './SupervisionScreen';

// يمنع ترجمة المتصفح التلقائية لنصوص الصفحة (تفسد العربية)
if (typeof document !== 'undefined') {
  try {
    const root = document.documentElement;
    root.setAttribute('lang', 'ar');
    root.setAttribute('translate', 'no');
    root.classList.add('notranslate');
    const meta = document.createElement('meta');
    meta.name = 'google';
    meta.content = 'notranslate';
    document.head.appendChild(meta);
    document.title = 'عين المستهلك - مديرية التجارة الداخلية باللاذقية';
  } catch (e) {}
}


// العنوان الفرعي في الترويسة لكل شاشة (كما في التصميم الأصلي)
const SUBTITLES = {
  login: 'بوابة تسجيل الدخول واختيار الصلاحيات',
  retail: 'منظومة ضبط الأسعار',
  wholesale: 'سجلات أسعار الجملة المعتمدة',
  citizen: 'منظومة الرقابة التموينية',
  supervision: 'منظومة الضابطة والرقابة التموينية',
};

function Shell() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState('login');
  const [role, setRole] = useState(null);

  const logout = () => {
    setRole(null);
    setScreen('login');
  };

  const enter = (r) => {
    setRole(r);
    setScreen(ROLE_TABS[r][0]);
  };
  const scrollRef = useRef(null);

  // زر الرجوع في أندرويد: من أي شاشة داخلية يعود إلى شاشة الدخول
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen !== 'login') {
        logout();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [screen]);

  // العودة لأعلى الصفحة عند تبديل الشاشة
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  }, [screen]);

  const showNav = screen !== 'login';
  const tabs = role ? ROLE_TABS[role] : [];
  const showTabs = showNav && tabs.length > 1;

  let body = null;
  if (screen === 'login') {
    body = (
      <LoginScreen onLogin={enter} onCitizenEntry={() => enter('citizen')} />
    );
  } else if (screen === 'retail') {
    body = <RetailScreen />;
  } else if (screen === 'wholesale') {
    body = <WholesaleScreen />;
  } else if (screen === 'citizen') {
    body = <CitizenScreen />;
  } else {
    body = <SupervisionScreen />;
  }

  return (
    // direction: 'rtl' يفرض اتجاه التخطيط من اليمين لليسار بغض النظر عن لغة الجهاز
    <View style={{ flex: 1, backgroundColor: C.bg, direction: 'rtl' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <GovHeader
        subtitle={SUBTITLES[screen]}
        topInset={insets.top}
        onLogout={showNav ? logout : undefined}
      />

      {/* تنويه ثابت: البيانات المعروضة للاختبار وليست رسمية */}
      <View
        style={{
          backgroundColor: C.amber50,
          borderBottomWidth: 1,
          borderBottomColor: C.amber200,
          paddingHorizontal: 16,
          paddingVertical: 5,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Icon name="info" size={14} color={C.amber800} />
        <Txt style={{ fontSize: 10, color: C.amber800, fontWeight: '500', flex: 1 }}>
          الأسعار والأرقام والسجلات المعروضة حالياً للاختبار فقط، وليست أسعاراً أو قرارات رسمية.
        </Txt>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: showTabs ? 24 : 24 + insets.bottom,
          width: '100%',
          maxWidth: 512,
          alignSelf: 'center',
        }}
      >
        {body}
      </ScrollView>

      {showTabs ? (
        <BottomNav tabs={tabs} active={screen} onChange={setScreen} bottomInset={insets.bottom} />
      ) : null}
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });

  // شاشة خضراء قصيرة حتى يُحمَّل الخط (وإن فشل التحميل يعمل التطبيق بالخط الافتراضي)
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: C.dark }} />;
  }

  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}
