$API = 'http://localhost:5000'
Write-Host "Starting smoke tests against $API"

# admin credentials from env (optional)
$adminEmail = $env:ADMIN_EMAIL
$adminPass = $env:ADMIN_PASSWORD
$adminToken = $null
if ($adminEmail -and $adminPass) {
  $res = Invoke-RestMethod -Method Post -Uri "$API/auth/login" -Body (@{ email = $adminEmail; password = $adminPass } | ConvertTo-Json) -ContentType 'application/json' -ErrorAction SilentlyContinue
  if ($res) { $adminToken = $res.token; Write-Host 'Admin login OK' } else { Write-Host 'Admin login failed' }
} else { Write-Host 'No admin creds in env; skipping admin login' }

# create client user via admin
$clientEmail = 'client@example.test'
$clientPass = 'clientpass'
if ($adminToken) {
  $body = @{ name='Client'; email=$clientEmail; password=$clientPass; role='user' } | ConvertTo-Json
  $res = Invoke-RestMethod -Method Post -Uri "$API/api/users" -Body $body -Headers @{ Authorization = "Bearer $adminToken" } -ContentType 'application/json' -ErrorAction SilentlyContinue
  Write-Host 'Create user response:'; $res
} else { Write-Host 'Skipping create user (no admin token)' }

# client login
# register client (if not exists)
$reg = Invoke-RestMethod -Method Post -Uri "$API/auth/register" -Body (@{ name='Client'; email=$clientEmail; password=$clientPass } | ConvertTo-Json) -ContentType 'application/json' -ErrorAction SilentlyContinue
Write-Host 'Register response:'; $reg

# client login
$res = Invoke-RestMethod -Method Post -Uri "$API/auth/login" -Body (@{ email=$clientEmail; password=$clientPass } | ConvertTo-Json) -ContentType 'application/json' -ErrorAction SilentlyContinue
if (-not $res) { Write-Host 'Client login failed'; exit 1 }
$token = $res.token; Write-Host 'Client login OK'

# create card via admin
if ($adminToken) {
  $cardUid = 'card-' + [int](Get-Random -Minimum 1000 -Maximum 9999)
  $body = @{ uid=$cardUid; user_id = $res.id; balance = 50 } | ConvertTo-Json
  $r2 = Invoke-RestMethod -Method Post -Uri "$API/api/cards" -Body $body -Headers @{ Authorization = "Bearer $adminToken" } -ContentType 'application/json' -ErrorAction SilentlyContinue
  Write-Host 'Create card response:'; $r2
} else { Write-Host 'Skipping create card (no admin token)' }

# call /auth/me
$r = Invoke-RestMethod -Uri "$API/auth/me" -Headers @{ Authorization = "Bearer $token" } -ErrorAction SilentlyContinue
Write-Host '/auth/me:'; $r

# list my cards
$r = Invoke-RestMethod -Uri "$API/api/cards/me/cards" -Headers @{ Authorization = "Bearer $token" } -ErrorAction SilentlyContinue
Write-Host '/api/cards/me/cards:'; $r

# pay with my card
if ($r -and $r.data -and $r.data.Count -gt 0) {
  $cid = $r.data[0].id
  $body = @{ card_id = $cid; amount = 2.5 } | ConvertTo-Json
  $p = Invoke-RestMethod -Method Post -Uri "$API/api/cards/me/pay" -Body $body -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -ErrorAction SilentlyContinue
  Write-Host '/api/cards/me/pay:'; $p
} else {
  Write-Host 'No cards, skipping pay'
}
