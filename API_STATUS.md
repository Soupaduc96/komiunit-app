# KomiUnit — API / Service Status

_Last updated: 2026-06-01_

---

## Architecture

```
Screen → Hook → Repository → Service → Supabase (direct queries)
                                     ↓
                              mappers.ts (snake_case → camelCase)
```

All services now use **direct Supabase queries** (not the generic `DatabaseService.query()` wrapper) to ensure:
- Correct column names (`lesson_order`, `author_name`, etc.)
- Join support (`komi_sends` ← `users`, `cart_items` ← `products`, etc.)
- Full-text search via `.ilike()`
- OR filters for call_logs, voice_messages, komi_sends

---

## Module: KomiSend

**Service:** `src/services/komi-send/send-service.ts`
**Hook:** `src/hooks/use-komi-send.ts`
**Repository:** `src/repositories/komi-send-repository.ts`

| Operation | Method | Status | Notes |
|---|---|---|---|
| List transfers | `getUserSends(userId)` | ✅ | JOINs recipient user for display name |
| Get by ID | `getSendById(id)` | ✅ | JOINs recipient user |
| Create transfer | `createSend(data)` | ✅ | Status defaults to `pending` |
| Update status | `updateSendStatus(id, status)` | ✅ | |
| List recipients | `getUserRecipients(userId)` | ✅ | Deduplicates by recipient_id |
| Find user by email | `findUserByEmail(email)` | ✅ | Used in send-money form |

**CRUD Coverage:** Create ✅ Read ✅ Update ✅ Delete —

---

## Module: KomiSol

**Service:** `src/services/komi-sol/solution-service.ts`
**Hook:** `src/hooks/use-komi-sol.ts`
**Repository:** `src/repositories/komi-sol-repository.ts`

| Operation | Method | Status | Notes |
|---|---|---|---|
| List solutions | `getSolutions(category?)` | ✅ | Filters by `status = published` |
| Get by ID | `getSolutionById(id)` | ✅ | |
| Search solutions | `searchSolutions(query)` | ✅ | Uses `.ilike()` on title + description |
| List categories | `getCategories()` | ✅ | |
| Increment views | `incrementViews(id)` | ✅ | Via RPC |
| Toggle like | `toggleLike(id, bool)` | ✅ | |
| Create ticket | `createTicket(data)` | ✅ | |
| List user tickets | `getUserTickets(userId)` | ✅ | |
| Update ticket | `updateTicket(id, updates)` | ✅ | status, priority |

**CRUD Coverage:** Create ✅ Read ✅ Update ✅ Delete —

---

## Module: KomiMarché

**Service:** `src/services/komi-marche/product-service.ts`
**Hook:** `src/hooks/use-komi-marche.ts`
**Repository:** `src/repositories/komi-marche-repository.ts`

| Operation | Method | Status | Notes |
|---|---|---|---|
| List products | `getProducts(category?)` | ✅ | Filters `stock > 0` |
| Get by ID | `getProductById(id)` | ✅ | |
| Search products | `searchProducts(query)` | ✅ | Uses `.ilike()` on name + description |
| List categories | `getCategories()` | ✅ | |
| Get cart | `getCart(userId)` | ✅ | JOINs `cart_items` ← `products`; computes `totalAmount` |
| Add to cart | `addToCart(userId, productId, qty)` | ✅ | Upserts (increments qty if duplicate) |
| Update cart qty | `updateCartItemQuantity(id, qty)` | ✅ | Removes if qty ≤ 0 |
| Remove from cart | `removeFromCart(cartItemId)` | ✅ | |
| Clear cart | `clearCart(userId)` | ✅ | Called automatically after `createOrder` |
| Create order | `createOrder(userId, address)` | ✅ | Reads cart, inserts `orders` + `order_items`, clears cart |
| List orders | `getUserOrders(userId)` | ✅ | JOINs `order_items` ← `products` |
| Get order | `getOrderById(id)` | ✅ | |
| Update order status | `updateOrderStatus(id, status)` | ✅ | |

**CRUD Coverage:** Create ✅ Read ✅ Update ✅ Delete ✅

---

## Module: KomiLearn

**Service:** `src/services/komi-learn/course-service.ts`
**Hook:** `src/hooks/use-komi-learn.ts`
**Repository:** `src/repositories/komi-learn-repository.ts`

| Operation | Method | Status | Notes |
|---|---|---|---|
| List courses | `getCourses(level?)` | ✅ | Ordered by `enrollments DESC` |
| Get course | `getCourseById(id)` | ✅ | |
| Search courses | `searchCourses(query)` | ✅ | Uses `.ilike()` on title, description, instructor_name |
| Get lessons | `getCourseLessons(courseId)` | ✅ | Ordered by `lesson_order ASC` |
| List categories | `getCategories()` | ✅ | |
| Enroll | `enrollCourse(userId, courseId)` | ✅ | Idempotent — returns existing if already enrolled |
| List enrolled | `getUserCourses(userId)` | ✅ | JOINs `user_progress` ← `courses` |
| Get progress | `getCourseProgress(userId, courseId)` | ✅ | |
| Update progress | `updateProgress(userId, courseId, lessonId)` | ✅ | Recalculates %, earns certificate at 100% |
| Increment enrollments | RPC `increment_course_enrollments` | ✅ | Best-effort, non-blocking |

**CRUD Coverage:** Create ✅ Read ✅ Update ✅ Delete —

---

## Module: KomiVoix

**Service:** `src/services/komi-voix/call-service.ts`
**Hook:** `src/hooks/use-komi-voix.ts`
**Repository:** `src/repositories/komi-voix-repository.ts`

| Operation | Method | Status | Notes |
|---|---|---|---|
| List contacts | `getUserContacts(userId)` | ✅ | Ordered by `contact_name` |
| Add contact | `addContact(userId, data)` | ✅ | Checks for duplicates, DB UNIQUE constraint |
| Update contact | `updateContact(id, updates)` | ✅ | name, phone, avatar |
| Remove contact | `removeContact(id)` | ✅ | |
| Get call logs | `getCallLogs(userId, limit?)` | ✅ | OR filter: caller_id OR recipient_id |
| Log call | `createCallLog(data)` | ✅ | |
| Send voice message | `sendVoiceMessage(data)` | ✅ | |
| Get voice messages | `getVoiceMessages(userId)` | ✅ | OR filter: sender OR recipient |
| Mark as read | `markVoiceMessageAsRead(id)` | ✅ | Sets `is_read = true`, `read_at = NOW()` |
| Unread count | `getUnreadCount(userId)` | ✅ | Uses `count: exact, head: true` |

**CRUD Coverage:** Create ✅ Read ✅ Update ✅ Delete ✅

---

## Data Mapper Layer

`src/services/supabase/mappers.ts` — one pure function per entity.

| Mapper | Input | Output |
|---|---|---|
| `mapUser` | `users` row | `User` |
| `mapSend` | `komi_sends` row (with optional `recipient` join) | `Send` |
| `mapRecipient` | `users` row | `Recipient` |
| `mapSolution` | `solutions` row | `Solution` |
| `mapSolutionCategory` | `solution_categories` row | `SolutionCategory` |
| `mapUserTicket` | `user_tickets` row | `UserTicket` |
| `mapProduct` | `products` row | `Product` |
| `mapCartItem` | `cart_items` row (with `products` join) | `CartItem` |
| `mapCart` | `userId` + `CartItem[]` | `Cart` (with computed `totalAmount`) |
| `mapOrder` | `orders` row (with `order_items.products` join) | `Order` |
| `mapProductCategory` | `product_categories` row | `ProductCategory` |
| `mapCourse` | `courses` row | `Course` |
| `mapLesson` | `lessons` row (handles `lesson_order` → `order`) | `Lesson` |
| `mapUserProgress` | `user_progress` row (with optional `courses` join) | `UserProgress` |
| `mapCourseCategory` | `course_categories` row | `CourseCategory` |
| `mapContact` | `contacts` row | `Contact` |
| `mapCallLog` | `call_logs` row | `CallLog` |
| `mapVoiceMessage` | `voice_messages` row | `VoiceMessage` |

---

## Error Handling

All services throw `new Error(error.message)` from Supabase errors. All hooks catch these and set `error: string | null` state. Screens render an `<EmptyState>` component when `error` is set.

Pattern in every hook:
```typescript
setLoading(true);
setError(null);
try {
  const data = await Service.method();
  setState(data);
} catch (err) {
  setError(err instanceof Error ? err.message : 'Fallback message');
} finally {
  setLoading(false);
}
```

---

## Known Limitations

| Item | Status |
|---|---|
| `solutions` admin write | Seeded via `npm run seed` only; no in-app creation UI |
| `products` admin write | Seeded via `npm run seed` only |
| `courses` + `lessons` admin write | Seeded via `npm run seed` only |
| Voice calling (WebRTC) | Not implemented — `createCallLog` logs metadata only |
| Audio file upload (voice messages) | `audio_url` field exists but storage upload not wired up |
| Realtime subscriptions | Not implemented; data refreshes on screen focus only |
| Pagination | `limit` param exists on `getCallLogs`; others return all rows |
