# Ví Dụ Sequence Diagram Format - Paper Submission Flow

## PlantUML Format

```plantuml
@startuml Paper Submission Flow
!theme plain
skinparam sequenceArrowThickness 2
skinparam roundcorner 20
skinparam maxmessagesize 60

actor Author as author #Blue
participant "Frontend" as frontend
participant "Backend API" as api #Gray
participant "Cloudinary" as cloudinary
database "PostgreSQL" as db #Gray
participant "Audit Log" as audit

== Paper Submission Flow ==

author -> frontend: 1. Xem danh sách conferences
frontend -> api: GET /conferences
api -> db: Query conferences
db --> api: Danh sách conferences
api --> frontend: Conference list
frontend --> author: Hiển thị conferences

author -> frontend: 2. Chọn conference và submit paper
note right of author
  - Title
  - Abstract
  - Track ID
  - Conference ID
  - PDF File
  - Co-authors
end note

frontend -> api: POST /submissions\n(FormData: title, abstract, file, etc.)
activate api

api -> api: 3. Validate deadline
alt Deadline passed
    api --> frontend: Error: Deadline passed
    frontend --> author: Hiển thị lỗi
else Deadline OK
    api -> api: 4. Validate file type (PDF only)
    api -> cloudinary: 5. Upload PDF file
    activate cloudinary
    cloudinary --> api: File URL
    deactivate cloudinary
    
    api -> db: 6. Save submission
    activate db
    db --> api: Submission ID
    deactivate db
    
    api -> audit: 7. Create audit log
    activate audit
    audit --> api: Log created
    deactivate audit
    
    api --> frontend: 8. Submission created
    deactivate api
    frontend --> author: Success message
end

@enduml
```

## Mermaid Format

```mermaid
sequenceDiagram
    participant Author
    participant Frontend
    participant API as Backend API
    participant Cloudinary
    participant DB as PostgreSQL
    participant Audit as Audit Log

    Author->>Frontend: 1. Xem danh sách conferences
    Frontend->>API: GET /conferences
    API->>DB: Query conferences
    DB-->>API: Danh sách conferences
    API-->>Frontend: Conference list
    Frontend-->>Author: Hiển thị conferences

    Author->>Frontend: 2. Submit paper<br/>(Title, Abstract, PDF, Track)
    Frontend->>API: POST /submissions
    
    alt Deadline OK
        API->>API: Validate deadline
        API->>API: Validate file type (PDF)
        API->>Cloudinary: Upload PDF
        Cloudinary-->>API: File URL
        API->>DB: Save submission
        DB-->>API: Submission ID
        API->>Audit: Create audit log
        API-->>Frontend: Success
        Frontend-->>Author: Submission created
    else Deadline passed
        API-->>Frontend: Error: Deadline passed
        Frontend-->>Author: Hiển thị lỗi
    end
```

## Review Assignment Flow Example (PlantUML)

```plantuml
@startuml Review Assignment Flow
!theme plain
skinparam sequenceArrowThickness 2
skinparam roundcorner 20

actor Chair as chair #Orange
participant "Backend API" as api #Gray
database "PostgreSQL" as db #Gray
participant "Email Service" as email
actor Reviewer as reviewer #Green
participant "Audit Log" as audit

== Manual Assignment ==

chair -> api: POST /reviews/assignments\n(submission_id, reviewer_id)
activate api

api -> db: Check COI
activate db
db --> api: COI status
deactivate db

alt COI exists
    api --> chair: Error: COI conflict
else No COI
    api -> db: Check existing assignment
    db --> api: Assignment status
    
    alt Already assigned
        api --> chair: Error: Already assigned
    else Not assigned
        api -> db: Save assignment\n(status: ASSIGNED)
        db --> api: Assignment ID
        api -> audit: Create audit log
        api -> email: Send notification email
        activate email
        email -> reviewer: Email notification
        deactivate email
        api --> chair: Assignment created
    end
end

deactivate api

== Auto Assignment ==

chair -> api: POST /reviews/assignments/auto\n(conference_id)
activate api

api -> db: Query submissions & reviewers
api -> api: Auto-assign algorithm\n(based on COI, workload, bids)
api -> db: Save multiple assignments
api -> email: Send bulk emails
email -> reviewer: Email notifications
api --> chair: Assignments created

deactivate api

@enduml
```

## Decision Making Flow Example (Mermaid)

```mermaid
sequenceDiagram
    participant Chair
    participant API as Backend API
    participant DB as PostgreSQL
    participant Email as Email Service
    participant Author

    Chair->>API: GET /reviews?submission_id=X
    API->>DB: Query all reviews
    DB-->>API: Reviews list
    API-->>Chair: Display reviews

    Chair->>API: POST /decisions<br/>(submission_id, decision, comments)
    
    API->>DB: Check review count
    alt Enough reviews
        API->>DB: Save decision
        DB-->>API: Decision ID
        API->>DB: Update submission status
        API->>Email: Send notification
        Email->>Author: Decision email
        API-->>Chair: Decision created
        
        alt Decision = Accept
            API->>DB: Enable camera-ready workflow
            Note over Author: Can upload camera-ready
        end
    else Not enough reviews
        API-->>Chair: Error: Need more reviews
    end
```

## Notes cho AI

Khi vẽ sequence diagram, cần lưu ý:

1. **Activation boxes**: Hiển thị khi actor đang xử lý (activate/deactivate)
2. **Alt/Opt/Loop frames**: Dùng cho các điều kiện thay thế
3. **Notes**: Thêm notes cho các điều kiện quan trọng
4. **Colors**: Phân biệt roles bằng màu sắc
5. **Error handling**: Hiển thị error flows
6. **Async operations**: Email service có thể async
7. **Database operations**: Hiển thị rõ query và response
