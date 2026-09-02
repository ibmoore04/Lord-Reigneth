# Lord Reigneth Foods — Website Functionality Presentation

## Overview

This presentation covers how the Lord Reigneth Foods website operates from a user and business perspective. It describes the complete user journeys, features, and operational flows that the website enables.

---

## Public User Journeys

### Browsing the Menu

1. **Visitor lands on homepage** — Sees hero section showcasing featured menu items ("Customer Favorites")
2. **Navigates to Menu page** — Views items organized by category tabs (Rice, Swallow, Soups, Proteins, Sides, Snacks, Drinks)
3. **Filters by category** — Sees only items relevant to selected category
4. **Views item details** — Reads description and sees item image
5. **Identifies favorite items** — Featured items are highlighted on homepage for customer favorites visibility

### Placing an Order

1. **Clicks "Order Now"** — Opens order placement interface
2. **Selects items** — Chooses menu items and quantities (cart-style selection)
3. **Provides delivery information** — Enter delivery address, landmark, or notes
4. **Chooses order type** — Pickup or delivery
5. **Chooses payment method** — Online card payment, cash on pickup, cash on delivery, WhatsApp ordering, or unpaid account
6. **Submits order** — Order created with order number generated server-side
7. **Sees confirmation** — Receives order number for tracking

### Tracking an Order

1. **Uses order tracking** — Enters order number and phone number
2. **Views status progression** — Sees current status: pending → confirmed → preparing → ready → out for delivery → completed
3. **Gets updates** — Status updates as order progresses through each stage

### Contacting the Restaurant

1. **Visits Contact page** — Sees phone number, address, opening hours
2. **Calls directly** — Clicks phone link to call the restaurant
3. **WhatsApp chat** — Clicks WhatsApp button to open chat with pre-filled message
4. **Submits contact form** — Sends message with name, email, phone, subject, message

### Exploring Other Pages

- **Our Story** — Reads brand narrative (25+ years at Ijebu Ode location, founder Deaconess Comfort Agoro)
- **Gallery** — Browses photos organized by category (food, restaurant images, catering events, behind-the-scenes); filters by category
- **Locations** — Views restaurant outlets with addresses, phone, hours; checks if currently open; sees Google Maps directions
- **Catering** — Submits catering enquiry form for events (weddings, birthdays, corporate parties, celebrations, milestones, other); provides event type, date, guest count, location, additional information

---

## Authenticated User Journeys

### Account & Order History

1. **Logs in** — Accesses account area with personal information
2. **Views order history** — Sees list of past orders with status and order numbers
3. **Reorders or tracks** — Selects an order to view details or track current status

### Profile Management

1. **Updates profile** — Changes name, phone, email as permitted
2. **Uploads avatar** — Profile picture update functionality

---

## Role-Based Access Control

### Customer Role

- Access to public pages (home, menu, story, locations, gallery, contact)
- Place orders via website or WhatsApp
- View own order history
- Track orders by order number and phone number
- Access account page

### Staff Role

- All customer permissions PLUS:
- Staff dashboard showing outlet-specific information
- View orders assigned to their outlet
- Real-time new order notifications
- Update order status as orders progress through stages (pending → confirmed → preparing → ready → out for delivery → completed)
- Manage menu item availability at their outlet
- Process WhatsApp orders for their outlet
- View outlet statistics (order counts by status)

### Admin Role

- All staff permissions PLUS:
- Full admin dashboard with overview
- View all orders system-wide
- Filter orders by status (pending, confirmed, preparing, completed, cancelled, etc.)
- Update order status across all outlets
- Manage menu items (create, edit, toggle availability)
- Manage menu categories (add, edit, reorder, deactivate)
- View and respond to catering requests
- Manage staff profiles (assign roles, assign outlets, activate/deactivate)
- Manage restaurant locations (add, edit, update hours/status)
- View messages, testimonials, gallery management
- Access site settings

---

## Business Logic & Operational Flows

### Order Creation Workflow

1. **Items validated** — Menu item IDs checked against available inventory and pricing system
2. **Order total calculated** — Final order total, delivery fee, and discount computed using current pricing
3. **Order number generated** — Unique order number assigned at creation time
4. **Item details snapshotted** — Item names and unit prices saved at purchase time (prices at time of order, not live)
5. **Payment status initialized** — Starts as unpaid, updated to paid when payment completes
6. **Order routed to correct outlet** — Based on customer location or staff assignment

### Order Status Progression

```
pending → confirmed → preparing → ready → out for delivery → completed
                    ↘
                  cancelled
```

- Each status transition validated and recorded
- Authorized staff can advance statuses through the progression
- Customers can view current status only

### WhatsApp Order Entry

1. **Staff selects items** from menu with outlet-specific availability
2. **Enters customer details** — name, phone, email (optional), delivery address
3. **Selects order type** — pickup or delivery
4. **Selects payment method** — card, cash on pickup, cash on delivery, WhatsApp, unpaid
5. **Server processes order** — Location automatically assigned from staff profile (not from customer input)
6. **Order number generated** and customer notified via WhatsApp channel

### Catering Enquiry Workflow

1. **Form submitted** with: name, phone, email, event type, event date, guest count, event location, additional notes
2. **Catering request created** with initial status
3. **Authorized reviewer sees request** in management interface
4. **Status updated** through stages: new → contacted → quoted → confirmed → completed or cancelled
5. **Administrative notes** added at each stage for internal tracking and follow-up

### Real-Time Status Updates

- **Management view** — New orders appear in instant updates at the top of the orders list
- **Staff view** — Sees new orders for their outlet only; receives alert (dismissable after period)
- **Customer view** — Subscribes to specific order; sees status updates as they happen
- **Automatic cleanup** — Subscriptions clear when no longer needed

### Location Availability

1. **Restaurant hours** defined per day of week (Monday-Saturday 7AM-9PM, Sunday closed)
2. **Current status check** — System verifies if location is open based on current time and day
3. **Location status** — Flag controls visibility of location in public pages and navigation
4. **Hours display** — Opening times shown in footer, locations page, and contact information

### Menu Availability Per Outlet

- **Global availability** — Each menu item has availability flag
- **Outlet overrides** — Per-location availability adjustments allowed
- **Authorized staff can toggle** — Mark items as available/unavailable at their specific outlet
- **Merged display** — Front-end combines global availability with outlet-specific rules

### Authentication Flow

1. **Account creation** — Creates user account with personal profile
2. **Sign in** — Email and password verification; session maintained with automatic refresh
3. **Session management** — Active session detected on return visits; refreshes in background
4. **Role assignment** — User profiles have role level (customer/staff/admin); determines accessible pages
5. **Access protection** — Unauthorized users redirected to login; wrong role redirected to public areas
6. **Sign out** — Session ended; user returns to unauthenticated state

### Password Recovery

1. **Forgot password** — User enters email address associated with account
2. **Reset link sent** — Password reset instructions delivered to email
3. **New password set** — User sets new credentials; automatically signed in
4. **Return to normal access** — Full functionality restored with new password

### Contact Form

1. **Submission** — Name, email, (optional) phone, subject, message details
2. **Stored in system** — Message recorded with initial status
3. **Review by authorized personnel** — Messages visible in management interface
4. **Status tracking** — Status can be updated: new → read → replied → archived

### Gallery Management

1. **Image upload** — Authorized user adds images to the collection
2. **Categorization** — Each image assigned to category: main food, restaurant photos, catering events, behind-the-scenes
3. **Display** — Front-end filters and shows images by category
4. **Featured images** — Marked for prominence on homepage or gallery section

### Testimonials

1. **Customer feedback** — Submitted with name, comments, rating (1-5 stars), optional photo
2. **Published status** — Flag controls visibility on website for public viewing
3. **Featured highlighting** — Featured testimonials displayed prominently in prominent locations
4. **Management review** — Authorized personnel can approve, feature, or remove testimonials

### Site Configuration (Single Source)

- **Configurable in one location**, updates propagate everywhere
- **Tagline** — Short phrase displayed in footer area
- **Years of service** — Number of years operating displayed automatically
- **Contact phone** — Updated in one place, appears throughout website (header, footer, contact page, ordering)
- **Social links** — Website social media profiles updated centrally
- **Operating hours** — Open/close times, open days displayed in footer and locations section
- **Restaurant address** — Main address appears in footer, contact page, locations, Google Maps links
- **SEO metadata** — Page titles and descriptions updated centrally

### Administrative Workflows

#### Daily Operations (Staff)

1. **Shift start** — Views outlet statistics (total orders, orders by status: pending, confirmed, preparing, ready, completed)
2. **New orders arrive** — Instant notification; picks up orders and updates status through progression
3. **Outlet management** — Toggles menu item availability as items run out or become available again
4. **End of shift** — Reviews completed orders; notes for next shift handover

#### Weekly/Monthly Operations (Admin)

1. **Revenue review** — Order summary with today's revenue, pending/completed counts, trend analysis
2. **Staff management** — Add new staff members, assign outlets, toggle active status
3. **Menu updates** — Add new items, remove seasonal items, update availability status
4. **Catering follow-up** — Review new requests; contact potential clients; convert to confirmed events
5. **Location management** — Update hours for seasons, add/remove outlets, update contact information

#### System Maintenance

1. **Menu item management** — Add, edit, deactivate items; toggle featured status; manage food images
2. **Category management** — Add new categories; reorder display sequence; manage category visibility
3. **Gallery updates** — Add new photos; re-categorize; mark as featured for prominence
4. **Testimonial management** — Approve new testimonials; feature standout feedback; remove inappropriate content
5. **Site settings updates** — Seasonal hours changes, contact info updates, new promotions or events

### User Experience Flows

#### First-Time Ordering

1. Visits site → browses menu → clicks "order now"
2. Selects items → enters delivery information → chooses payment method → submits order
3. Receives order number → notes or books it for tracking
4. Can track order using order number and phone number
5. Future orders — faster checkout with remembered preferences (via persistent cart state)

#### Returning Customer

1. Logs in → sees order history → clicks previous order to re-order or track status
2. Or proceeds directly to order now with saved profile information (name, phone, email)
3. Faster checkout via saved profile details

#### Catering Inquiry

1. Navigates to catering section → fills out event form (event type, date, guest count, location, notes)
2. Submits → receives confirmation message
3. Authorized reviewer sees request in management interface
4. Reviewer updates status through stages (new → contacted → quoted → confirmed)
5. Client may be contacted for details; event confirmed when status reaches 'confirmed'
6. Event day → catering fulfilled; status updated to 'completed'

#### Staff Daily Work

1. Logs in → sees outlet-specific dashboard with current statistics
2. Views new order alerts → processes orders through status chain (pending → confirmed → etc.)
3. Updates menu availability as needed during shift (items running out/available again)
4. Reviews end-of-shift statistics for reporting and handover
5. Handover to next shift with pending order summary and notes

#### Admin Weekly Review

1. Logs in → dashboard overview with key metrics
2. Reviews revenue and order counts for the period
3. Reviews pending catering requests and follow-up actions needed
4. Updates menu as needed for seasonality or availability changes
5. Reviews staff performance and outlet metrics
6. Updates site settings for any changes (hours, contact, promotions, events)

### Data Integrity & Business Rules

- **Pricing accuracy** — Order totals always calculated using current pricing at time of order; prices displayed before order are estimates only
- **Location consistency** — Brand information (25+ years, Ijebu Ode location) verified from central configuration
- **Phone format** — Consistent international format throughout all contact displays and links
- **Event date validation** — Catering event dates checked for reasonableness (not in past, within reasonable booking window)
- **Guest count validation** — Reasonable ranges for catering events based on venue and service type
- **Order sequencing** — Status progression follows logical business flow; unauthorized transitions blocked
- **Customer order isolation** — Users can only access their own order history and tracking
- **Staff outlet scoping** — Staff can only manage orders and menu items for their assigned outlet
- **Authorized admin access** — Admin routes require appropriate role level at both interface and data level

### Integration Points

- **Payment processing** — Secure transaction handling for card payments (when selected as payment method)
- **Messaging platform** — Order notifications and customer service contact via messaging service
- **Maps service** — Location directions and mapping for restaurant outlets
- **Email system** — Order confirmations, password resets, catering communications
- **Scheduling** — Event date management for catering reservations

The presentation is now complete and focuses entirely on user workflows and business functionality without referencing any development technologies.