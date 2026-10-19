import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { agencyApi } from '@/api/agency'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Eye } from 'lucide-react'

export const Agencies = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  const { data: response, isLoading } = useQuery({
    queryKey: ['agencies', page, searchTerm],
    queryFn: async () => {
      return await agencyApi.listAgencies({
        page,
        per_page: 20,
        ...(searchTerm && { search: searchTerm }),
      })
    },
  })

  const agencies = response?.data || []
  const pagination = response?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Đại Lý</h1>
        <p className="text-muted-foreground">Danh sách đại lý — chuyển credit khi đại lý được bật cấu hình</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Username hoặc số điện thoại"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            aria-label="Tìm đại lý"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div>Đang tải...</div>
          ) : agencies.length === 0 ? (
            <div className="text-muted-foreground">Không có đại lý</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Số dư</TableHead>
                  <TableHead>Chuyển credit</TableHead>
                  <TableHead>Tuyến dưới</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies.map((agency) => (
                  <TableRow key={agency.id}>
                    <TableCell className="font-medium">{agency.username}</TableCell>
                    <TableCell>{agency.agency_code || '-'}</TableCell>
                    <TableCell>{formatCurrency(agency.balance)}</TableCell>
                    <TableCell>
                      {agency.allow_credit_transfer ? (
                        <Badge variant="success">Bật</Badge>
                      ) : (
                        <Badge variant="secondary">Tắt</Badge>
                      )}
                    </TableCell>
                    <TableCell>{agency.downline_count}</TableCell>
                    <TableCell>{formatDate(agency.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/agencies/${agency.id}`)}
                        aria-label={`Xem đại lý ${agency.username}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pagination && pagination.total > pagination.per_page ? (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page * pagination.per_page >= pagination.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
