import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MemoryCardProps } from "../types";

export function MemoryCard({
  coffeeDate,
  onEdit: _onEdit,
  onDelete: _onDelete,
  isAuthenticated: _isAuthenticated,
}: MemoryCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{coffeeDate.cafeInfo.name}</span>
          <Badge variant="secondary">☕ {coffeeDate.ratings.coffee}/5</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {coffeeDate.cafeInfo.formattedAddress}
          </p>
          <p className="text-sm">
            {new Date(coffeeDate.visitDate).toLocaleDateString()}
          </p>
          {coffeeDate.ratings.dessert && (
            <Badge variant="outline">🍰 {coffeeDate.ratings.dessert}/5</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
