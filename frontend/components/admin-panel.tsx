'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslation } from '@/app/hooks/useTranslation';
import { languages } from '@/app/utils/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Globe, Users, BarChart2, Settings2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminPanel() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Only render for admin users
  if (!user || user.role !== 'ADMIN') {
    return null;
  }
  
  const handleLanguageChange = (lang: 'en' | 'bg') => {
    setLanguage(lang);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            className="w-full"
          >
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Admin Panel</span>
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="w-[90vw] max-w-[800px] md:w-[800px] h-[80vh] max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.title')}</DialogTitle>
            <DialogDescription>
              {t('admin.settings')}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="language">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
              <TabsTrigger value="language" className="flex items-center justify-center gap-2">
                <Globe className="h-4 w-4" />
                {t('admin.languageSettings')}
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                {t('admin.users')}
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center justify-center gap-2">
                <BarChart2 className="h-4 w-4" />
                {t('admin.statistics')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="language" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.languageSettings')}</CardTitle>
                  <CardDescription>
                    {t('admin.currentLanguage')}: {languages[language]}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-sm font-medium">{t('admin.chooseLanguage')}</h3>
                    <div className="flex flex-wrap gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant={language === 'en' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => handleLanguageChange('en')}
                          className="flex items-center gap-2"
                        >
                          🇬🇧 English
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant={language === 'bg' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => handleLanguageChange('bg')}
                          className="flex items-center gap-2"
                        >
                          🇧🇬 Български
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.users')}</CardTitle>
                  <CardDescription>
                    {t('admin.userManagement')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    User management functionality coming soon!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="statistics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.statistics')}</CardTitle>
                  <CardDescription>
                    System statistics and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Statistics functionality coming soon!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
} 