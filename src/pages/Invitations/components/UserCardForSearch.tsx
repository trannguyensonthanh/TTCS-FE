// src/pages/Invitations/components/UserCardForSearch.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, CheckCircle } from 'lucide-react';
import { NguoiDungTimKiemItem } from '@/services/nguoiDung.service';
import { getInitials } from '@/utils/stringUtils'; // Đảm bảo bạn có hàm này
import { cn } from '@/lib/utils';

interface UserCardForSearchProps {
  user: NguoiDungTimKiemItem;
  onAdd: () => void;
  isAdded: boolean;
}

export const UserCardForSearch: React.FC<UserCardForSearchProps> = ({
  user,
  onAdd,
  isAdded,
}) => {
  return (
    <Card
      className={cn(
        'p-3 shadow-sm hover:shadow-md transition-shadow duration-200',
        isAdded &&
          'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={user.anhDaiDien || undefined} alt={user.hoTen} />
            <AvatarFallback>{getInitials(user.hoTen)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow overflow-hidden">
            <p className="text-sm font-semibold truncate text-foreground">
              {user.hoTen}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.maDinhDanh} - {user.loaiNguoiDungHienThi}
            </p>
            <p className="text-xs text-muted-foreground truncate italic">
              {user.thongTinThem}
            </p>
          </div>
        </div>
        <Button
          variant={isAdded ? 'outline' : 'default'}
          size="sm"
          onClick={onAdd}
          disabled={isAdded}
          className={cn(
            'whitespace-nowrap shrink-0 h-8 px-2.5 text-xs',
            isAdded &&
              'border-green-500 text-green-600 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-800/30'
          )}
        >
          {isAdded ? (
            <>
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Đã thêm
            </>
          ) : (
            <>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Thêm vào DS
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
