# Tournament Testing - 10 Test User Profiles for Postman

## Overview
This collection contains 10 diverse user profiles designed to test tournament age validation, team eligibility, and various tournament scenarios.

---

## API Base URL
```
{{baseURL}}/api/auth/register
```
**Environment Variable**: `baseURL` = `http://localhost:5000`

---

## Test User Profiles

### **1. Alex Thompson (Team Captain - 28 years old)**
**Use Case**: Tournament host, team captain, meets all age requirements

```json
POST {{baseURL}}/api/auth/register
Content-Type: application/json

{
  "name": "Alex Thompson",
  "email": "alex.thompson@test.com",
  "password": "password123",
  "mobile": "+1234567890",
  "dob": "1995-03-15",
  "location": "Mumbai, Maharashtra, India",
  "geoLocation": {
    "type": "Point",
    "coordinates": [72.8777, 19.0760]
  }
}
```

### **2. Sarah Mitchell (Young Player - 17 years old)**
**Use Case**: Below 18+ age limit testing

```json
POST {{baseURL}}/api/auth/register
Content-Type: application/json

{
  "name": "Sarah Mitchell", 
  "email": "sarah.mitchell@test.com",
  "password": "password123",
  "mobile": "+1234567891",
  "dob": "2006-08-22",
  "location": "Delhi, India",
  "geoLocation": {
    "type": "Point", 
    "coordinates": [77.1025, 28.7041]
  }
}
```

### **3. Michael Rodriguez (Senior Player - 45 years old)**
**Use Case**: Testing maximum age limits

```json
POST {{baseURL}}/api/auth/register
Content-Type: application/json

{
  "name": "Michael Rodriguez",
  "email": "michael.rodriguez@test.com", 
  "password": "password123",
  "mobile": "+1234567892",
  "dob": "1978-12-08",
  "location": "Bangalore, Karnataka, India",
  "geoLocation": {
    "type": "Point",
    "coordinates": [77.5946, 12.9716]
  }
}
```

### **4. Priya Sharma (Perfect Age - 25 years old)**
**Use Case**: Ideal tournament participant

```json
POST {{baseURL}}/api/auth/register
Content-Type: application/json

{
  "name": "Priya Sharma",
  "email": "priya.sharma@test.com",
  "password": "password123", 
  "mobile": "+1234567893",
  "dob": "1998-06-10",
  "location": "Pune, Maharashtra, India",
  "geoLocation": {
    "type": "Point",
    "coordinates": [73.8567, 18.5204]
  }
}
```

### **5. James Wilson (Football Specialist - 22 years old)**
**Use Case**: Sport-specific team testing

```json
POST {{baseURL}}/api/auth/register
Content-Type: application/json

{
  "name": "James Wilson",
  "email": "james.wilson@test.com",
  "password": "password123",
  "mobile": "+1234567894", 
  "dob": "2001-09-18",
  "location": "Chennai, Tamil Nadu, India",
  "geoLocation": {
    "type": "Point",
    "coordinates": [80.2707, 13.0827]
  }
}
```

### **6. Emily Chen (Tennis Player - 24 years old)**
**Use Case**: Individual sports testing

```json
POST {{baseURL}}/api/auth/register
Content-Type: application/json

{
  "name": "Emily Chen",
  "email": "emily.chen@test.com",
  "password": "password123",
  "mobile": "+1234567895",
  "dob": "1999-04-30",
  "location": "Hyderabad, Telangana, India", 
  "geoLocation": {
    "type": "Point",
    "coordinates": [78.4867, 17.3850]
  }
}
```

### **7. Raj Patel (Just 18 - Edge Case)**
**Use Case**: Testing minimum age boundary

```json
POST {{baseURL}}/api/auth/register
Content-Type: application/json

{
  "name": "Raj Patel", 
  "email": "raj.patel@test.com",
  "password": "password123",
  "mobile": "+1234567896",
  "dob": "2005-10-18",
  "location": "Kolkata, West Bengal, India",
  "geoLocation": {
    "type": "Point",
    "coordinates": [88.3639, 22.5726]
  }
}
```

### **8. Lisa Anderson (Team Manager - 32 years old)**
**Use Case**: Team management, tournament organization

```json
POST {{baseURL}}/api/auth/register
Content-Type: application/json

{
  "name": "Lisa Anderson",
  "email": "lisa.anderson@test.com", 
  "password": "password123",
  "mobile": "+1234567897",
  "dob": "1991-01-25",
  "location": "Jaipur, Rajasthan, India",
  "geoLocation": {
    "type": "Point", 
    "coordinates": [75.7873, 26.9124]
  }
}
```

### **9. David Kumar (Cricket Expert - 29 years old)**
**Use Case**: Cricket tournaments, team formation

```json
POST {{baseURL}}/api/auth/register
Content-Type: application/json

{
  "name": "David Kumar",
  "email": "david.kumar@test.com",
  "password": "password123",
  "mobile": "+1234567898", 
  "dob": "1994-07-14",
  "location": "Ahmedabad, Gujarat, India",
  "geoLocation": {
    "type": "Point",
    "coordinates": [72.5714, 23.0225]
  }
}
```

### **10. Maria Santos (Multi-Sport - 26 years old)**
**Use Case**: Multiple sport participation, mixed tournaments

```json
POST {{baseURL}}/api/auth/register
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria.santos@test.com",
  "password": "password123",
  "mobile": "+1234567899",
  "dob": "1997-11-03", 
  "location": "Kochi, Kerala, India",
  "geoLocation": {
    "type": "Point",
    "coordinates": [76.2673, 9.9312]
  }
}
```

---

## Testing Scenarios

### **Age Validation Testing**
1. **Under 18**: Sarah Mitchell (17) - Should be rejected from 18+ tournaments
2. **Exactly 18**: Raj Patel (18) - Should pass 18+ requirements  
3. **Over 35**: Michael Rodriguez (45) - Should be rejected from U35 tournaments
4. **Perfect Range**: Alex, Priya, Emily, Lisa, David, Maria (22-32) - Should pass most age requirements

### **Tournament Creation Testing**
Use these users to create tournaments with different requirements:
- **Alex Thompson**: Create 18+ Football tournament
- **Lisa Anderson**: Create U30 Basketball tournament  
- **Emily Chen**: Create Tennis singles tournament
- **David Kumar**: Create Cricket team tournament

### **Team Formation Testing**
Create teams with mixed ages to test validation:
- **Team 1**: Alex (28) + Sarah (17) + James (22) → Should fail 18+ tournaments
- **Team 2**: Priya (25) + Emily (24) + Maria (26) → Should pass most requirements
- **Team 3**: Michael (45) + David (29) + Lisa (32) → Should fail U35 tournaments

### **Sport-Specific Testing**
- **Football**: Alex, James, Raj
- **Tennis**: Emily, Maria  
- **Cricket**: David, Michael
- **Basketball**: Lisa, Priya, Sarah

---

## Postman Collection Setup

### **Environment Variables**
```json
{
  "baseURL": "http://localhost:5000"
}
```

### **Pre-request Script** (for all requests)
```javascript
// Auto-generate test data variations
const users = [
  "alex.thompson", "sarah.mitchell", "michael.rodriguez", 
  "priya.sharma", "james.wilson", "emily.chen", 
  "raj.patel", "lisa.anderson", "david.kumar", "maria.santos"
];

// Set dynamic email for batch testing
if (pm.globals.get("userIndex")) {
  let index = parseInt(pm.globals.get("userIndex"));
  pm.globals.set("userIndex", (index + 1) % users.length);
} else {
  pm.globals.set("userIndex", 0);
}
```

### **Tests Script** (for all requests)
```javascript
pm.test("Registration successful", function () {
    pm.response.to.have.status(201);
});

pm.test("Token received", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson.token).to.exist;
    
    // Store token for subsequent requests
    pm.globals.set("authToken", responseJson.token);
});

pm.test("User data returned", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson.user).to.exist;
    pm.expect(responseJson.user.name).to.exist;
    pm.expect(responseJson.user.email).to.exist;
});
```

---

## Tournament Testing Workflow

### **Step 1**: Register all 10 users
Run all registration requests and collect tokens.

### **Step 2**: Create teams with different compositions
```bash
# Example team with age issues
POST {{baseURL}}/api/teams
Authorization: Bearer {{alexToken}}
{
  "name": "Mixed Age Team",
  "sportType": "football", 
  "description": "Team with diverse age range",
  "minAge": 0
}

# Add Sarah (17) and Michael (45) to test age validation
```

### **Step 3**: Create tournaments with various requirements
```bash
POST {{baseURL}}/api/tournaments  
Authorization: Bearer {{alexToken}}
{
  "name": "Elite Football Championship",
  "gameType": "football",
  "ageLimit": 18,
  "entryCriteria": {
    "ageLimitMin": 18,
    "ageLimitMax": 35,
    "teamSizeLimit": {
      "min": 8,
      "max": 11
    }
  }
}
```

### **Step 4**: Test team join requests
```bash
POST {{baseURL}}/api/tournaments/{{tournamentId}}/join
Authorization: Bearer {{teamOwnerToken}}
{
  "teamId": "{{teamId}}"
}
```

### **Expected Results**
- ✅ Age-compliant teams: Accepted or pending approval
- ❌ Under-age teams: Rejected with "age-below-min" 
- ❌ Over-age teams: Rejected with "age-above-max"
- ❌ Wrong sport teams: Rejected with "sport-type-mismatch"
- ❌ Wrong size teams: Rejected with "team-too-small" or "team-too-large"

This comprehensive test suite will validate all tournament validation features and provide clear feedback on rejection reasons!
