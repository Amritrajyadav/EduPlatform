const API_BASE_URL = "https://eduplatform-5i45.onrender.com/api";
const API_URL = `${API_BASE_URL}/auth`;

function getToken() {
    return localStorage.getItem("token");
}

function getLoggedInUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch (error) {
        return null;
    }
}

function authHeaders(extraHeaders = {}) {
    const token = getToken();

    return {
        ...extraHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: authHeaders(options.headers || {})
    });

    if (response.status === 401 || response.status === 403) {
        showToast("Session expired or access denied. Please login again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);
    }

    return response;
}

function showToast(message, type = "info") {
    const oldToast = document.querySelector(".toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function toggleTeacherFields() {
    const role = document.getElementById("role").value;
    const teacherFields = document.getElementById("teacherFields");

    teacherFields.style.display = role === "teacher" ? "block" : "none";
}

async function registerUser() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const mobile = document.getElementById("mobile").value;
    const role = document.getElementById("role").value;
    const subject = document.getElementById("subject")?.value || "";
    const experience = document.getElementById("experience")?.value || "";

    showLoader("Creating Account...");

    try {

        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                mobile,
                role,
                subject,
                experience
            })
        });

        const data = await res.json();

        hideLoader();

        if (res.ok) {
            showToast(data.message || "Account Created", "success");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);

        } else {
            showToast(data.message || "Registration Failed", "error");
        }

    } catch (error) {

        hideLoader();

        console.log(error);

        showToast("Server Error", "error");
    }
}

async function loginUser() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    showLoader("Logging In...");

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    hideLoader();

    if (res.ok) {
        showToast(data.message, "success");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
            if (data.user.role === "student") {
                window.location.href = "student-dashboard.html";
            } else if (data.user.role === "teacher") {
                window.location.href = "teacher-dashboard.html";
            } else if (data.user.role === "admin") {
                window.location.href = "admin-dashboard.html";
            }
        }, 1000);
    } else {
        showToast(data.message, "error");
    }
}

function checkAuth(requiredRole) {
    const token = localStorage.getItem("token");
    const user = getLoggedInUser();

    if (!token || !user) {
        showToast("Please login first", "error");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);
        return;
    }

    if (user.role !== requiredRole) {
        showToast("Access denied", "error");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);
        return;
    }
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    showToast("Logged out successfully", "success");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
}

async function loadCourses() {

    showLoader("Loading Courses...");

    const res = await fetch(`${API_BASE_URL}/course/all`);
    const data = await res.json();

    hideLoader();

    const container = document.getElementById("courseContainer");
    container.innerHTML = "";

    data.courses.forEach(course => {

        container.innerHTML += `
            <div class="card course-card">

                <div class="course-banner">
                    🚀 Learn Skills
                </div>

                <div class="course-content">

                    <h3>${course.title}</h3>

                    <p>${course.description}</p>

                    <h4>₹ ${course.price}</h4>

                    <div class="course-buttons">

                        <button onclick="buyCourse(${course.id})">
                            Buy Now
                        </button>

                        <button onclick="openCourseFromCourses(${course.id})">
                            Open Course
                        </button>

                    </div>

                </div>

            </div>
        `;
    });
}

async function buyCourse(courseId) {
    const user = getLoggedInUser();

    if (!user) {
        showToast("Please login first", "error");
        return;
    }

    showLoader("Processing Dummy Payment...");

    setTimeout(async () => {
        const res = await apiFetch(`${API_BASE_URL}/course/buy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                studentId: user.id,
                courseId: courseId
            })
        });

        const data = await res.json();

        hideLoader();

        if (res.ok) {
            showToast("Dummy payment successful. Course unlocked!", "success");
        } else {
            showToast(data.message, "error");
        }
    }, 1500);
}

async function openCourseFromCourses(courseId) {
    const user = getLoggedInUser();

    if (!user) {
        showToast("Please login first", "error");
        window.location.href = "login.html";
        return;
    }

    const res = await apiFetch(`${API_BASE_URL}/course/purchased-course/${courseId}`);
    const data = await res.json();

    if (!res.ok) {
        showToast(data.message || "Please purchase this course first", "error");
        return;
    }

    localStorage.setItem("selectedCourseId", courseId);
    window.location.href = "course-player.html";
}

async function loadMyCourses() {

    showLoader("Loading Your Courses...");

    const user = getLoggedInUser();

    if (!user) {
        hideLoader();
        window.location.href = "login.html";
        return;
    }

    const res = await apiFetch(
        `${API_BASE_URL}/course/purchased/${user.id}`
    );

    const data = await res.json();

    hideLoader();

    const container = document.getElementById("myCoursesContainer");

    container.innerHTML = "";

    if (!data.courses || data.courses.length === 0) {
        container.innerHTML = "<p>No purchased courses found.</p>";
        return;
    }

    let progressMap = {};

    try {
        const progressRes = await apiFetch(`${API_BASE_URL}/progress/my`);
        const progressData = await progressRes.json();

        if (progressRes.ok && Array.isArray(progressData.progress)) {
            progressData.progress.forEach(item => {
                progressMap[item.courseId] = item;
            });
        }
    } catch (error) {
        console.log("Progress loading failed", error);
    }

    data.courses.forEach(course => {
        const progress = progressMap[course.id] || { progressPercent: 0, isCompleted: false };
        const percent = Number(progress.progressPercent) || 0;

        container.innerHTML += `
            <div class="card">

                <h3>${course.title}</h3>

                <p>${course.description}</p>

                <h4>₹ ${course.price}</h4>

                <div class="progress-wrap">
                    <div class="progress-info">
                        <span>${progress.isCompleted ? "Completed" : "Progress"}</span>
                        <strong>${percent}%</strong>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width:${percent}%"></div>
                    </div>
                </div>

                <button onclick="openCourse(${course.id})">
                    ${percent > 0 ? "Continue Learning" : "Open Course"}
                </button>

                <button onclick="openMockTest(${course.id})">
                    Mock Test
                </button>

                ${progress.isCompleted ? `<button onclick="openCourse(${course.id})">View Certificate</button>` : ""}

            </div>
        `;
    });
}

function openCourse(courseId) {
    localStorage.setItem("selectedCourseId", courseId);
    window.location.href = "course-player.html";
}

function openMockTest(courseId) {
    localStorage.setItem("selectedCourseId", courseId);
    window.location.href = "mock-test.html";
}

async function loadCoursePlayer() {

    showLoader("Loading Course Player...");

    const courseId = localStorage.getItem("selectedCourseId");

    if (!courseId) {

        hideLoader();

        showToast("No course selected", "error");

        window.location.href = "student-dashboard.html";

        return;
    }

    const res = await apiFetch(
        `${API_BASE_URL}/course/purchased-course/${courseId}`
    );

    const data = await res.json();

    hideLoader();

    if (!res.ok) {

        showToast(data.message || "Please purchase this course first", "error");

        window.location.href = "student-dashboard.html";

        return;
    }

    const course = data.course;

    if (!course) {

        showToast("Course not found", "error");

        window.location.href = "student-dashboard.html";

        return;
    }

    document.getElementById("courseTitle").innerText =
        course.title;

    document.getElementById("courseDescription").innerText =
        course.description;

    const video = document.getElementById("courseVideo");

    const source = document.getElementById("videoSource");

    if (!course.videoUrl) {
        showToast("Video is not uploaded yet", "error");
        return;
    }

    source.src = course.videoUrl;

    video.load();
    setupCourseProgress(courseId, video);
    loadCertificateStatus(courseId);
}

async function setupCourseProgress(courseId, video) {
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("courseProgressFill");
    const completeBtn = document.getElementById("markCompleteBtn");
    let lastSavedAt = 0;

    function updateProgressUI(percent) {
        const safePercent = Math.max(0, Math.min(100, Math.round(percent || 0)));

        if (progressText) {
            progressText.innerText = `${safePercent}% Completed`;
        }

        if (progressFill) {
            progressFill.style.width = `${safePercent}%`;
        }

        if (completeBtn) {
            completeBtn.innerText = safePercent >= 95 ? "Completed" : "Mark as Complete";
        }
    }

    async function saveProgress(forceComplete = false) {
        if (!video.duration || Number.isNaN(video.duration)) return;

        const now = Date.now();

        if (!forceComplete && now - lastSavedAt < 10000) {
            return;
        }

        lastSavedAt = now;

        const watchedSeconds = forceComplete ? video.duration : video.currentTime;
        const totalSeconds = video.duration;

        try {
            const res = await apiFetch(`${API_BASE_URL}/progress/${courseId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    watchedSeconds,
                    totalSeconds,
                    isCompleted: forceComplete
                })
            });

            const data = await res.json();

            if (res.ok && data.progress) {
                updateProgressUI(data.progress.progressPercent);
                loadCertificateStatus(courseId);
            }
        } catch (error) {
            console.log("Progress save failed", error);
        }
    }

    try {
        const res = await apiFetch(`${API_BASE_URL}/progress/${courseId}`);
        const data = await res.json();

        if (res.ok && data.progress) {
            updateProgressUI(data.progress.progressPercent);
            loadCertificateStatus(courseId);

            const resumeFromSavedTime = () => {
                const watchedSeconds = Number(data.progress.watchedSeconds) || 0;

                if (watchedSeconds > 0 && watchedSeconds < video.duration - 5) {
                    video.currentTime = watchedSeconds;
                }
            };

            if (video.readyState >= 1) {
                resumeFromSavedTime();
            } else {
                video.addEventListener("loadedmetadata", resumeFromSavedTime, { once: true });
            }
        }
    } catch (error) {
        console.log("Progress fetch failed", error);
    }

    video.addEventListener("timeupdate", () => {
        if (!video.duration || Number.isNaN(video.duration)) return;

        const percent = (video.currentTime / video.duration) * 100;
        updateProgressUI(percent);
        saveProgress(false);
    });

    video.addEventListener("pause", () => saveProgress(false));
    video.addEventListener("ended", () => saveProgress(true));

    if (completeBtn) {
        completeBtn.onclick = () => saveProgress(true);
    }
}

async function createCourseFromTeacher() {
    const user = getLoggedInUser();

    const title = document.getElementById("courseTitle").value;
    const description = document.getElementById("courseDescription").value;
    const price = document.getElementById("coursePrice").value;
    const thumbnail = document.getElementById("courseThumbnail").value;

    const res = await apiFetch(`${API_BASE_URL}/course/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            description,
            price,
            thumbnail,
            videoUrl: "",
            teacherId: user.id
        })
    });

    const data = await res.json();

    if (res.ok) {

        const courseId = data.course?.id || data.newCourse?.id || data.id;

        showToast(`${data.message}. Course ID: ${courseId}`, "success");

        alert(
            `Course Created Successfully!\n\nCourse ID: ${courseId}\n\nUse this Course ID to upload video, notes and mock questions.`
        );

    } else {
        showToast(data.message, "error");
    }
}

async function uploadCourseVideo() {
    const courseId = document.getElementById("uploadCourseId").value;
    const videoFile = document.getElementById("courseVideoFile").files[0];

    if (!videoFile) {
        showToast("Please select a video file", "error");
        return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

    const res = await apiFetch(`${API_BASE_URL}/course/upload-video/${courseId}`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (res.ok) {
        showToast(data.message, "success");
    } else {
        showToast(data.message, "error");
    }
}

let mockQuestions = [];

async function loadMockTest() {
    const courseId = localStorage.getItem("selectedCourseId");

    if (!courseId) {
        document.getElementById("mockTestContainer").innerHTML = `
            <div class="card">
                <h3>Please open mock test from your purchased course.</h3>
            </div>
        `;
        return;
    }
    console.log("Selected Course ID:", courseId);

    const res = await apiFetch(`${API_BASE_URL}/mocktest/${courseId}`);
    const data = await res.json();

    console.log("Mock Test Data:", data);

    const container = document.getElementById("mockTestContainer");
    container.innerHTML = "";

    mockQuestions = data.questions || data.mockQuestions || data.mockTests || data.data || [];

    if (!Array.isArray(mockQuestions) || mockQuestions.length === 0) {
        container.innerHTML = `
            <div class="card">
                <h3>No Mock Questions Found</h3>
            </div>
        `;
        return;
    }

    mockQuestions.forEach((q, index) => {
        container.innerHTML += `
            <div class="card test-question">
                <h3>Q${index + 1}. ${q.question || q.question_text}</h3>

                <label><input type="radio" name="question${q.id}" value="A"> ${q.optionA || q.option_a}</label>
                <label><input type="radio" name="question${q.id}" value="B"> ${q.optionB || q.option_b}</label>
                <label><input type="radio" name="question${q.id}" value="C"> ${q.optionC || q.option_c}</label>
                <label><input type="radio" name="question${q.id}" value="D"> ${q.optionD || q.option_d}</label>
            </div>
        `;
    });
}

async function submitMockTest() {
    let score = 0;

    mockQuestions.forEach(q => {
        const selected = document.querySelector(`input[name="question${q.id}"]:checked`);

        if (selected && selected.value === q.correctAnswer) {
            score++;
        }
    });

    document.getElementById("testResult").innerText =
        `Your Score: ${score} / ${mockQuestions.length}`;

    const user = getLoggedInUser();
    const courseId = localStorage.getItem("selectedCourseId") || 1;

    const res = await apiFetch(`${API_BASE_URL}/result/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            studentId: user.id,
            courseId: courseId,
            score: score,
            totalQuestions: mockQuestions.length
        })
    });

    const data = await res.json();

    if (res.ok) {
        showToast(data.message, "success");
    } else {
        showToast(data.message, "error");
    }
}

async function loadMyResults() {

    showLoader("Loading Results...");

    const user = getLoggedInUser();

    if (!user) {
        hideLoader();
        window.location.href = "login.html";
        return;
    }

    const res = await apiFetch(
        `${API_BASE_URL}/result/student/${user.id}`
    );

    const data = await res.json();

    hideLoader();

    const container = document.getElementById("resultContainer");

    container.innerHTML = "";

    if (data.results.length === 0) {

        container.innerHTML = "<p>No results found</p>";

        return;
    }

    data.results.forEach(result => {

        container.innerHTML += `
            <div class="card">

                <h3>
                    Course ID: ${result.courseId}
                </h3>

                <p>
                    Score:
                    ${result.score}
                    /
                    ${result.totalQuestions}
                </p>

                <p>
                    Date:
                    ${new Date(result.createdAt).toLocaleString()}
                </p>

            </div>
        `;
    });
}

async function loadAdminDashboard() {

    showLoader("Loading Admin Dashboard...");

    const res = await apiFetch(
        `${API_BASE_URL}/admin/dashboard`
    );

    const data = await res.json();

    hideLoader();

    if (!res.ok) {
        showToast(data.message || "Unable to load admin dashboard", "error");
        return;
    }

    // STATS
    document.getElementById("totalUsers").innerText =
        data.totalUsers;

    document.getElementById("totalStudents").innerText =
        data.totalStudents;

    document.getElementById("totalTeachers").innerText =
        data.totalTeachers;

    document.getElementById("totalAdmins").innerText =
        data.totalAdmins;

    document.getElementById("totalCourses").innerText =
        data.totalCourses;

    document.getElementById("totalPurchases").innerText =
        data.totalPurchases;

    document.getElementById("totalPayments").innerText =
        data.totalPayments;

    // USERS TABLE
    const usersTable =
        document.getElementById("adminUsersTable");

    usersTable.innerHTML = "";

    data.users.forEach(user => {

        usersTable.innerHTML += `
            <tr>

                <td>${user.id}</td>

                <td>${user.name}</td>

                <td>${user.email}</td>

                <td>${user.role}</td>

                <td>${user.mobile || "-"}</td>

                <td>
                    <button
                        onclick="deleteUser(${user.id})"
                        class="delete-btn"
                    >
                        Delete
                    </button>
                </td>

            </tr>
        `;
    });

    // COURSES
    const courseContainer =
        document.getElementById("adminCourseContainer");

    courseContainer.innerHTML = "";

    data.courses.forEach(course => {

        courseContainer.innerHTML += `
            <div class="card">

                <h3>${course.title}</h3>

                <p>${course.description}</p>

                <h4>₹ ${course.price}</h4>

                <button
                    class="delete-btn"
                    onclick="deleteCourse(${course.id})"
                >
                    Delete Course
                </button>

            </div>
        `;
    });

    // PURCHASES
    const purchasesTable =
        document.getElementById("adminPurchasesTable");

    purchasesTable.innerHTML = "";

    data.purchases.forEach(purchase => {

        purchasesTable.innerHTML += `
            <tr>

                <td>${purchase.id}</td>

                <td>${purchase.studentId}</td>

                <td>${purchase.courseId}</td>

                <td>Purchased</td>

                <td>
                    ${new Date(
                        purchase.createdAt
                    ).toLocaleString()}
                </td>

            </tr>
        `;
    });

    // PAYMENTS
    const paymentsTable =
        document.getElementById("adminPaymentsTable");

    paymentsTable.innerHTML = "";

    data.payments.forEach(payment => {

        paymentsTable.innerHTML += `
            <tr>

                <td>${payment.id}</td>

                <td>${payment.studentId}</td>

                <td>${payment.courseId}</td>

                <td>₹ ${payment.amount}</td>

                <td>${payment.status}</td>

            </tr>
        `;
    });
}

async function uploadCourseNote() {
    const courseId = document.getElementById("noteCourseId").value;
    const title = document.getElementById("noteTitle").value;
    const noteFile = document.getElementById("noteFile").files[0];

    if (!courseId || !title || !noteFile) {
        showToast("Please fill all note fields", "error");
        return;
    }

    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("title", title);
    formData.append("note", noteFile);

    const res = await apiFetch(`${API_BASE_URL}/notes/upload`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (res.ok) {
        showToast(data.message, "success");
    } else {
        showToast(data.message, "error");
    }
}

async function loadCourseNotes() {
    const courseId = localStorage.getItem("selectedCourseId");

    const res = await apiFetch(`${API_BASE_URL}/notes/${courseId}`);
    const data = await res.json();

    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    if (!data.notes || data.notes.length === 0) {
        container.innerHTML = "<p>No notes uploaded yet</p>";
        return;
    }

    data.notes.forEach(note => {
        container.innerHTML += `
            <div class="card">
                <h3>${note.title}</h3>
                <a href="https://eduplatform-5i45.onrender.com/uploads/${note.fileUrl}" target="_blank">
                    View / Download
                </a>
            </div>
        `;
    });
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}

function loadTheme() {
    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    }
}

function showLoader(message = "Loading...") {
    let loader = document.querySelector(".loader");

    if (!loader) {
        loader = document.createElement("div");
        loader.className = "loader";

        loader.innerHTML = `
            <div class="loader-box">
                <div class="spinner"></div>
                <p id="loaderText">${message}</p>
            </div>
        `;

        document.body.appendChild(loader);
    }

    document.getElementById("loaderText").innerText = message;
    loader.classList.add("active");
}

function hideLoader() {
    const loader = document.querySelector(".loader");

    if (loader) {
        loader.classList.remove("active");
    }
}

function loadProfile() {

    const user =
        getLoggedInUser();

    if (!user) {

        showToast("Please login first", "error");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);

        return;
    }

    document.getElementById("profileName").innerText =
        user.name;

    document.getElementById("profileEmail").innerText =
        user.email;

    document.getElementById("profileRole").innerText =
        user.role;

    document.getElementById("profileId").innerText =
        user.id;

    document.getElementById(
        "profileRoleBadge"
    ).innerText =
        user.role.toUpperCase();

    if (user.profilePhoto) {

        document.getElementById(
            "profileImage"
        ).src = user.profilePhoto;
    }
}

function goToDashboard() {
    const user = getLoggedInUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.role === "student") {
        window.location.href = "student-dashboard.html";
    } else if (user.role === "teacher") {
        window.location.href = "teacher-dashboard.html";
    } else if (user.role === "admin") {
        window.location.href = "admin-dashboard.html";
    }
}

function loadDashboardUser() {
    const user = getLoggedInUser();

    if (!user) return;

    const userName = document.getElementById("dashboardUserName");

    if (userName) {
        userName.innerText = user.name;
    }

    const avatar = document.querySelector(".dashboard-avatar");

    if (avatar && user.profilePhoto) {
        avatar.innerHTML = `
            <img
                src="${user.profilePhoto}"
                style="
                    width:100%;
                    height:100%;
                    border-radius:50%;
                    object-fit:cover;
                "
            >
        `;
    }
}

async function uploadProfilePhoto() {

    const input =
        document.getElementById("profilePhotoInput");

    const file = input.files[0];

    if (!file) {
        showToast("Please select an image", "error");
        return;
    }

    const user =
        getLoggedInUser();

    if (!user) {
        showToast("Please login first", "error");
        return;
    }

    try {

        showLoader("Uploading Photo...");

        const formData = new FormData();

        formData.append("photo", file);
        formData.append("userId", user.id);

        const res = await apiFetch(
            `${API_BASE_URL}/profile/upload-photo`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await res.json();

        hideLoader();

        console.log(data);
        
        if (res.ok) {

            const imageUrl = data.photoUrl;

            user.profilePhoto = imageUrl;

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            document.getElementById(
                "profileImage"
            ).src = imageUrl;

            showToast(
                "Profile photo uploaded successfully",
                "success"
            );

        } else {

            showToast(
                data.message || "Upload failed",
                "error"
            );
        }

    } catch (error) {

        hideLoader();

        console.log(error);

        showToast(
            "Server Error",
            "error"
        );
    }
}

async function deleteProfilePhoto() {

    const user =
        getLoggedInUser();

    if (!user) {
        showToast("Please login first", "error");
        return;
    }

    try {

        showLoader("Deleting Photo...");

        const res = await apiFetch(
            `${API_BASE_URL}/profile/delete-photo`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    userId: user.id
                })
            }
        );

        const data = await res.json();

        hideLoader();

        if (res.ok) {

            user.profilePhoto = null;

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            document.getElementById(
                "profileImage"
            ).src =
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

            showToast(
                "Profile photo deleted",
                "success"
            );

        } else {

            showToast(
                data.message,
                "error"
            );
        }

    } catch (error) {

        hideLoader();

        console.log(error);

        showToast(
            "Server Error",
            "error"
        );
    }
}

async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) {
        return;
    }

    showLoader("Deleting User...");

    const res = await apiFetch(
        `${API_BASE_URL}/admin/delete-user/${userId}`,
        {
            method: "DELETE"
        }
    );

    const data = await res.json();

    hideLoader();

    if (res.ok) {
        showToast(data.message, "success");
        loadAdminDashboard();
    } else {
        showToast(data.message, "error");
    }
}

async function deleteCourse(courseId) {
    if (!confirm("Are you sure you want to delete this course?")) {
        return;
    }

    showLoader("Deleting Course...");

    const res = await apiFetch(
        `${API_BASE_URL}/admin/delete-course/${courseId}`,
        {
            method: "DELETE"
        }
    );

    const data = await res.json();

    hideLoader();

    if (res.ok) {
        showToast(data.message, "success");
        loadAdminDashboard();
    } else {
        showToast(data.message, "error");
    }
}
async function loadCertificateStatus(courseId) {
    const panel = document.getElementById("certificatePanel");
    const statusText = document.getElementById("certificateStatusText");
    const issueBtn = document.getElementById("issueCertificateBtn");

    if (!panel || !courseId) return;

    try {
        const res = await apiFetch(`${API_BASE_URL}/certificate/status/${courseId}`);
        const data = await res.json();

        if (!res.ok) {
            if (statusText) statusText.innerText = data.message || "Certificate status unavailable";
            return;
        }

        panel.style.display = "block";

        if (data.certificate) {
            if (statusText) {
                statusText.innerText = `Certificate unlocked • ID: ${data.certificate.certificateId}`;
            }
            if (issueBtn) {
                issueBtn.innerText = "View / Download Certificate";
                issueBtn.disabled = false;
                issueBtn.onclick = () => openCertificate(data.certificate, data.course);
            }
            return;
        }

        if (data.isEligible) {
            if (statusText) statusText.innerText = "Course completed. Certificate is ready to unlock.";
            if (issueBtn) {
                issueBtn.innerText = "Unlock Certificate";
                issueBtn.disabled = false;
                issueBtn.onclick = () => issueCertificate(courseId);
            }
        } else {
            if (statusText) {
                statusText.innerText = `Complete 95% course to unlock certificate. Current progress: ${data.progressPercent || 0}%`;
            }
            if (issueBtn) {
                issueBtn.innerText = "Certificate Locked";
                issueBtn.disabled = true;
            }
        }
    } catch (error) {
        console.log("Certificate status failed", error);
    }
}

async function issueCertificate(courseId) {
    try {
        showLoader("Unlocking Certificate...");

        const res = await apiFetch(`${API_BASE_URL}/certificate/issue/${courseId}`, {
            method: "POST"
        });

        const data = await res.json();
        hideLoader();

        if (res.ok) {
            showToast(data.message, "success");
            openCertificate(data.certificate, data.course, data.student);
        } else {
            showToast(data.message || "Certificate unlock failed", "error");
        }
    } catch (error) {
        hideLoader();
        console.log(error);
        showToast("Server Error", "error");
    }
}

function openCertificate(certificate, course, student = null) {
    const user = student || getLoggedInUser();

    localStorage.setItem("selectedCertificate", JSON.stringify({
        certificate,
        course,
        student: user
    }));

    window.location.href = "certificates.html";
}

async function loadMyCertificates() {
    showLoader("Loading Certificates...");

    const res = await apiFetch(`${API_BASE_URL}/certificate/my`);
    const data = await res.json();

    hideLoader();

    const container = document.getElementById("certificatesContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!res.ok) {
        showToast(data.message || "Unable to load certificates", "error");
        return;
    }

    if (!data.certificates || data.certificates.length === 0) {
        container.innerHTML = `
            <div class="card">
                <h3>No certificates yet</h3>
                <p>Complete a course to 95% or more to unlock your certificate.</p>
            </div>
        `;
        return;
    }

    data.certificates.forEach(item => {
        const courseTitle = item.course?.title || `Course ID: ${item.courseId}`;
        container.innerHTML += `
            <div class="card certificate-list-card">
                <h3>${courseTitle}</h3>
                <p><strong>Certificate ID:</strong> ${item.certificateId}</p>
                <p><strong>Issued:</strong> ${new Date(item.issuedAt).toLocaleDateString()}</p>
                <button onclick='openCertificate(${JSON.stringify(item).replace(/'/g, "&apos;")}, ${JSON.stringify(item.course || {}).replace(/'/g, "&apos;")})'>
                    View / Download
                </button>
            </div>
        `;
    });
}

function renderCertificatePage() {
    const raw = localStorage.getItem("selectedCertificate");

    if (!raw) {
        const holder = document.getElementById("certificatePrintArea");
        if (holder) {
            holder.innerHTML = "<p>No certificate selected.</p>";
        }
        return;
    }

    const data = JSON.parse(raw);
    const certificate = data.certificate || data;
    const course = data.course || {};
    const student = data.student || getLoggedInUser() || {};

    const studentName = student.name || "Student";
    const courseTitle = course.title || "Completed Course";
    const issuedDate = certificate.issuedAt
        ? new Date(certificate.issuedAt).toLocaleDateString()
        : new Date().toLocaleDateString();

    const nameEl = document.getElementById("certStudentName");
    const courseEl = document.getElementById("certCourseName");
    const dateEl = document.getElementById("certIssuedDate");
    const idEl = document.getElementById("certId");

    if (nameEl) nameEl.innerText = studentName;
    if (courseEl) courseEl.innerText = courseTitle;
    if (dateEl) dateEl.innerText = issuedDate;
    if (idEl) idEl.innerText = certificate.certificateId || "AMRIT-CERT";
}

function downloadCertificate() {
    const certificate = document.getElementById("certificatePrintArea");

    if (!certificate) {
        showToast("Certificate not found", "error");
        return;
    }

    const studentName =
        document.getElementById("certStudentName")?.innerText || "Student";

    const fileName =
        `EduPlatform-Certificate-${studentName.replace(/\s+/g, "-")}.pdf`;

    const options = {
        margin: 0.3,
        filename: fileName,
        image: {
            type: "jpeg",
            quality: 0.98
        },
        html2canvas: {
            scale: 2,
            useCORS: true
        },
        jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "landscape"
        }
    };

    html2pdf()
        .set(options)
        .from(certificate)
        .save();
}

/* ================= ADVANCED LMS FEATURES ================= */
function safeText(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

async function getPurchasedCourseIds() {
    const user = getLoggedInUser();
    if (!user || user.role !== 'student') return [];
    try {
        const res = await apiFetch(`${API_BASE_URL}/course/purchased/${user.id}`);
        const data = await res.json();
        return (data.courses || []).map(c => Number(c.id));
    } catch { return []; }
}

async function loadCourses() {
    showLoader("Loading Courses...");
    const [courseRes, purchasedIds] = await Promise.all([
        fetch(`${API_BASE_URL}/course/all`),
        getPurchasedCourseIds()
    ]);
    const data = await courseRes.json();
    hideLoader();

    window.allCoursesCache = data.courses || [];
    window.purchasedCourseIdsCache = purchasedIds;
    renderCourses(window.allCoursesCache);
}

function renderCourses(courses) {
    const container = document.getElementById("courseContainer");
    if (!container) return;
    container.innerHTML = "";

    const search = (document.getElementById('courseSearch')?.value || '').toLowerCase();
    const maxPrice = Number(document.getElementById('courseMaxPrice')?.value || 0);
    const onlyFree = document.getElementById('courseFreeOnly')?.checked;

    const filtered = (courses || []).filter(course => {
        const title = `${course.title} ${course.description}`.toLowerCase();
        const price = Number(course.price || 0);
        return (!search || title.includes(search)) && (!maxPrice || price <= maxPrice) && (!onlyFree || price === 0);
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="card"><h3>No courses found</h3><p>Try changing search/filter.</p></div>';
        return;
    }

    filtered.forEach(course => {
        const purchased = (window.purchasedCourseIdsCache || []).includes(Number(course.id));
        container.innerHTML += `
            <div class="card course-card ${purchased ? 'unlocked-course' : 'locked-course'}">
                <div class="course-banner">${purchased ? '✅ Unlocked' : '🔒 Locked'}</div>
                <div class="course-content">
                    <h3>${safeText(course.title)}</h3>
                    <p>${safeText(course.description)}</p>
                    <h4>₹ ${safeText(course.price)}</h4>
                    ${purchased ? '' : '<div class="buy-overlay">Buy Course to unlock videos, notes, quizzes and certificate.</div>'}
                    <div class="course-buttons">
                        ${purchased ? `<button onclick="openCourseFromCourses(${course.id})">Open Course</button>` : `<button onclick="buyCourse(${course.id})">Buy Course</button>`}
                        <button onclick="toggleWishlist(${course.id})">♡ Wishlist</button>
                        <button onclick="openReviews(${course.id})">Reviews</button>
                    </div>
                </div>
            </div>`;
    });
}

function applyCourseFilters() {
    renderCourses(window.allCoursesCache || []);
}

async function loadAdminDashboard() {
    showLoader("Loading Admin Dashboard...");
    const res = await apiFetch(`${API_BASE_URL}/admin/dashboard`);
    const data = await res.json();
    hideLoader();

    if (!res.ok) return showToast(data.message || "Unable to load admin dashboard", "error");

    const set = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value ?? 0; };
    set("totalUsers", data.totalUsers); set("totalStudents", data.totalStudents); set("totalTeachers", data.totalTeachers);
    set("totalAdmins", data.totalAdmins); set("totalCourses", data.totalCourses); set("totalPurchases", data.totalPurchases); set("totalPayments", data.totalPayments);
    set("totalRevenue", `₹ ${data.totalRevenue || 0}`); set("activeStudents", data.activeStudents || 0); set("pendingAssignments", data.pendingAssignments || 0);
    set("pendingReviews", data.pendingReviews || 0); set("mostPurchasedCourse", data.mostPurchasedCourse?.title || "No data");

    const usersTable = document.getElementById("adminUsersTable");
    if (usersTable) {
        usersTable.innerHTML = "";
        (data.users || []).forEach(user => usersTable.innerHTML += `<tr><td>${user.id}</td><td>${safeText(user.name)}</td><td>${safeText(user.email)}</td><td>${safeText(user.role)}</td><td>${safeText(user.mobile || '-')}</td><td><button onclick="deleteUser(${user.id})" class="delete-btn">Delete</button></td></tr>`);
    }

    const courseContainer = document.getElementById("adminCourseContainer");
    if (courseContainer) {
        courseContainer.innerHTML = "";
        (data.courses || []).forEach(course => courseContainer.innerHTML += `<div class="card"><h3>${safeText(course.title)}</h3><p>${safeText(course.description)}</p><h4>₹ ${course.price}</h4><button class="delete-btn" onclick="deleteCourse(${course.id})">Delete Course</button></div>`);
    }

    const purchasesTable = document.getElementById("adminPurchasesTable");
    if (purchasesTable) {
        purchasesTable.innerHTML = "";
        (data.purchases || []).forEach(p => purchasesTable.innerHTML += `<tr><td>${p.id}</td><td>${p.studentId}</td><td>${p.courseId}</td><td>Purchased</td><td>${new Date(p.createdAt).toLocaleString()}</td></tr>`);
    }

    const paymentsTable = document.getElementById("adminPaymentsTable");
    if (paymentsTable) {
        paymentsTable.innerHTML = "";
        (data.payments || []).forEach(p => paymentsTable.innerHTML += `<tr><td>${p.id}</td><td>${p.studentId}</td><td>${p.courseId}</td><td>₹ ${p.amount}</td><td>${p.status}</td></tr>`);
    }

    renderAdminChart(data.chartData || []);
}

function renderAdminChart(chartData) {
    const canvas = document.getElementById('adminSalesChart');
    if (!canvas || typeof Chart === 'undefined') return;
    new Chart(canvas, {
        type: 'bar',
        data: { labels: chartData.map(x => x.title), datasets: [{ label: 'Purchases', data: chartData.map(x => x.purchases) }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

async function loadNotifications() {
    const box = document.getElementById('notificationsBox');
    if (!box) return;
    const res = await apiFetch(`${API_BASE_URL}/features/notifications`);
    const data = await res.json();
    box.innerHTML = (data.notifications || []).map(n => `<div class="mini-item"><strong>${safeText(n.title)}</strong><p>${safeText(n.message)}</p></div>`).join('') || '<p>No notifications.</p>';
}

async function sendAdminNotification() {
    const title = document.getElementById('notifyTitle').value;
    const message = document.getElementById('notifyMessage').value;
    const role = document.getElementById('notifyRole').value;
    const res = await apiFetch(`${API_BASE_URL}/features/notifications`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, message, role }) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
}

async function toggleWishlist(courseId) {
    const res = await apiFetch(`${API_BASE_URL}/features/wishlist`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ courseId }) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
}

async function loadWishlist() {
    const box = document.getElementById('wishlistContainer');
    if (!box) return;
    const res = await apiFetch(`${API_BASE_URL}/features/wishlist`);
    const data = await res.json();
    box.innerHTML = (data.courses || []).map(c => `<div class="card"><h3>${safeText(c.title)}</h3><p>${safeText(c.description)}</p><button onclick="buyCourse(${c.id})">Buy</button></div>`).join('') || '<div class="card">No wishlist courses.</div>';
}

function openReviews(courseId) {
    localStorage.setItem('selectedCourseId', courseId);
    window.location.href = 'reviews.html';
}

async function loadReviews() {
    const courseId = localStorage.getItem('selectedCourseId') || document.getElementById('reviewCourseId')?.value;
    const box = document.getElementById('reviewsContainer');
    if (!box || !courseId) return;
    const res = await apiFetch(`${API_BASE_URL}/features/reviews/${courseId}`);
    const data = await res.json();
    box.innerHTML = (data.reviews || []).map(r => `<div class="card"><h3>${'⭐'.repeat(Number(r.rating || 0))}</h3><p>${safeText(r.comment)}</p><small>Status: ${r.status}</small></div>`).join('') || '<p>No approved reviews yet.</p>';
}

async function submitReview() {
    const courseId = localStorage.getItem('selectedCourseId') || document.getElementById('reviewCourseId').value;
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;
    const res = await apiFetch(`${API_BASE_URL}/features/reviews`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ courseId, rating, comment }) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
    loadReviews();
}

async function createAssignment() {

    const payload = {
        courseId: document.getElementById('assignmentCourseId').value,
        question: document.getElementById('assignmentQuestion').value,
        optionA: document.getElementById('optionA').value,
        optionB: document.getElementById('optionB').value,
        optionC: document.getElementById('optionC').value,
        optionD: document.getElementById('optionD').value,
        correctAnswer: document.getElementById('correctAnswer').value
    };

    showLoader("Creating Mock Test...");

    try {

        const res = await apiFetch(
            `${API_BASE_URL}/mocktest/create`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await res.json();

        hideLoader();

        if (res.ok) {

            showToast(data.message, "success");

            document.getElementById('assignmentQuestion').value = "";
            document.getElementById('optionA').value = "";
            document.getElementById('optionB').value = "";
            document.getElementById('optionC').value = "";
            document.getElementById('optionD').value = "";
            document.getElementById('correctAnswer').value = "";

        } else {

            showToast(data.message, "error");
        }

    } catch (error) {

        hideLoader();

        console.log(error);

        showToast("Server Error", "error");
    }
}

async function loadAssignments() {
    const courseId = localStorage.getItem('selectedCourseId') || document.getElementById('assignmentCourseId')?.value;
    const box = document.getElementById('assignmentsContainer');
    if (!box || !courseId) return;
    const res = await apiFetch(`${API_BASE_URL}/features/assignments/${courseId}`);
    const data = await res.json();
    box.innerHTML = (data.assignments || []).map(a => `<div class="card"><h3>${safeText(a.title)}</h3><p>${safeText(a.question)}</p><textarea id="answer_${a.id}" placeholder="Your answer / code"></textarea><input type="file" id="file_${a.id}"><button onclick="submitAssignment(${a.id})">Submit</button></div>`).join('') || '<p>No assignments.</p>';
}

async function submitAssignment(assignmentId) {
    const form = new FormData();
    form.append('answer', document.getElementById(`answer_${assignmentId}`).value);
    const file = document.getElementById(`file_${assignmentId}`).files[0];
    if (file) form.append('file', file);
    const res = await apiFetch(`${API_BASE_URL}/features/assignments/submit/${assignmentId}`, { method:'POST', body: form });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
}

async function createLiveClass() {
    const payload = { courseId: liveCourseId.value, title: liveTitle.value, meetLink: liveMeetLink.value, scheduledAt: liveScheduledAt.value };
    const res = await apiFetch(`${API_BASE_URL}/features/live-classes`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
}

async function loadLiveClasses() {
    const box = document.getElementById('liveClassesContainer');
    if (!box) return;
    const courseId = localStorage.getItem('selectedCourseId') || '';
    const res = await apiFetch(`${API_BASE_URL}/features/live-classes${courseId ? '/' + courseId : ''}`);
    const data = await res.json();
    box.innerHTML = (data.liveClasses || []).map(c => `<div class="card"><h3>${safeText(c.title)}</h3><p>${new Date(c.scheduledAt).toLocaleString()}</p><a target="_blank" href="${safeText(c.meetLink)}">Join Class</a></div>`).join('') || '<p>No live classes.</p>';
}

async function savePersonalNote() {
    const courseId = localStorage.getItem('selectedCourseId') || noteCourseId.value;
    const payload = { courseId, title: personalNoteTitle.value, content: personalNoteContent.value, timestampSeconds: personalNoteTime.value || 0 };
    const res = await apiFetch(`${API_BASE_URL}/features/student-notes`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
    loadPersonalNotes();
}

async function loadPersonalNotes() {
    const box = document.getElementById('personalNotesContainer');
    const courseId = localStorage.getItem('selectedCourseId') || document.getElementById('noteCourseId')?.value;
    if (!box || !courseId) return;
    const res = await apiFetch(`${API_BASE_URL}/features/student-notes/${courseId}`);
    const data = await res.json();
    box.innerHTML = (data.notes || []).map(n => `<div class="card"><h3>${safeText(n.title)}</h3><p>${safeText(n.content)}</p><small>${n.timestampSeconds}s</small></div>`).join('') || '<p>No personal notes.</p>';
}

async function postDiscussion() {
    const courseId = localStorage.getItem('selectedCourseId') || discussionCourseId.value;
    const message = discussionMessage.value;
    const res = await apiFetch(`${API_BASE_URL}/features/discussion`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ courseId, message }) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
    loadDiscussion();
}

async function loadDiscussion() {
    const box = document.getElementById('discussionContainer');
    const courseId = localStorage.getItem('selectedCourseId') || document.getElementById('discussionCourseId')?.value;
    if (!box || !courseId) return;
    const res = await apiFetch(`${API_BASE_URL}/features/discussion/${courseId}`);
    const data = await res.json();
    box.innerHTML = (data.posts || []).map(p => `<div class="card"><p>${safeText(p.message)}</p><small>User #${p.userId}</small></div>`).join('') || '<p>No discussions yet.</p>';
}

async function askAi() {
    const prompt = document.getElementById('aiPrompt').value;
    const res = await apiFetch(`${API_BASE_URL}/features/ai`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) });
    const data = await res.json();
    document.getElementById('aiAnswer').innerText = data.answer || data.message;
}

async function activateSubscription(plan) {
    const res = await apiFetch(`${API_BASE_URL}/features/subscription`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ plan }) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
    loadSubscription();
}

async function loadSubscription() {
    const box = document.getElementById('subscriptionStatus');
    if (!box) return;
    const res = await apiFetch(`${API_BASE_URL}/features/subscription`);
    const data = await res.json();
    box.innerHTML = data.subscription ? `<div class="card"><h3>${data.subscription.plan} plan active</h3><p>Valid till ${new Date(data.subscription.endDate).toLocaleDateString()}</p></div>` : '<div class="card">No active subscription.</div>';
}

async function uploadResume() {
    const form = new FormData();
    form.append('title', resumeTitle.value);
    form.append('file', resumeFile.files[0]);
    const res = await apiFetch(`${API_BASE_URL}/features/resume`, { method:'POST', body: form });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
    loadPlacement();
}

async function applyJob() {
    const res = await apiFetch(`${API_BASE_URL}/features/jobs/apply`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ company: jobCompany.value, role: jobRole.value }) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
    loadPlacement();
}

async function loadPlacement() {
    const box = document.getElementById('placementContainer');
    if (!box) return;
    const res = await apiFetch(`${API_BASE_URL}/features/placement`);
    const data = await res.json();
    box.innerHTML = `<h3>Resumes</h3>${(data.resumes || []).map(r => `<div class="mini-item">${safeText(r.title)} - <a target="_blank" href="https://eduplatform-5i45.onrender.com/uploads/${safeText(r.fileUrl)}">View</a></div>`).join('') || '<p>No resume.</p>'}<h3>Applications</h3>${(data.applications || []).map(a => `<div class="mini-item">${safeText(a.company)} - ${safeText(a.role)} (${a.status})</div>`).join('') || '<p>No applications.</p>'}`;
}

async function createLesson() {
    const payload = { courseId: lessonCourseId.value, title: lessonTitle.value, contentType: lessonType.value, contentUrl: lessonUrl.value, sortOrder: lessonOrder.value || 1 };
    const res = await apiFetch(`${API_BASE_URL}/features/lessons`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
}

async function loadLessons() {
    const box = document.getElementById('lessonsContainer');
    const courseId = localStorage.getItem('selectedCourseId');
    if (!box || !courseId) return;
    const res = await apiFetch(`${API_BASE_URL}/features/lessons/${courseId}`);
    const data = await res.json();
    box.innerHTML = (data.lessons || []).map(l => `<div class="mini-item"><strong>${safeText(l.sortOrder)}. ${safeText(l.title)}</strong><p>${safeText(l.contentType)} ${l.contentUrl ? '- ' + safeText(l.contentUrl) : ''}</p></div>`).join('') || '<p>No module lessons added yet.</p>';
}

async function loadLeaderboard() {
    const box = document.getElementById('leaderboardContainer');
    if (!box) return;
    const res = await apiFetch(`${API_BASE_URL}/features/leaderboard`);
    const data = await res.json();
    box.innerHTML = `<table class="admin-table"><thead><tr><th>Rank</th><th>Student</th><th>XP</th><th>Completed</th><th>Avg Score</th></tr></thead><tbody>${(data.leaderboard || []).map((r,i) => `<tr><td>${i+1}</td><td>${safeText(r.name)}</td><td>${r.xp}</td><td>${r.completedCourses}</td><td>${r.avgScore}</td></tr>`).join('')}</tbody></table>`;
}

async function verifyEmail() {
    const res = await fetch(`${API_URL}/verify-email`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: verifyEmailInput.value, otp: verifyOtp.value }) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
}

async function forgotPassword() {
    const res = await fetch(`${API_URL}/forgot-password`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: forgotEmail.value }) });
    const data = await res.json();
    showToast(data.devResetToken ? `Token: ${data.devResetToken}` : data.message, res.ok ? 'success' : 'error');
}

async function resetPassword() {
    const res = await fetch(`${API_URL}/reset-password`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: resetEmail.value, token: resetToken.value, newPassword: resetNewPassword.value }) });
    const data = await res.json();
    showToast(data.message, res.ok ? 'success' : 'error');
}


async function loadMockQuestionsForManage() {
    const courseId = document.getElementById("manageMockCourseId").value;
    const container = document.getElementById("manageMockQuestionsContainer");

    if (!courseId) {
        showToast("Please enter Course ID", "error");
        return;
    }

    showLoader("Loading Questions...");

    try {
        const res = await apiFetch(`${API_BASE_URL}/mocktest/manage/${courseId}`);
        const data = await res.json();

        hideLoader();

        container.innerHTML = "";

        if (!res.ok) {
            showToast(data.message || "Unable to load questions", "error");
            return;
        }

        if (!data.questions || data.questions.length === 0) {
            container.innerHTML = "<p>No questions found.</p>";
            return;
        }

        data.questions.forEach((q, index) => {
            container.innerHTML += `
                <div class="card">
                    <h3>Q${index + 1}. ${q.question}</h3>
                    <p>A. ${q.optionA}</p>
                    <p>B. ${q.optionB}</p>
                    <p>C. ${q.optionC}</p>
                    <p>D. ${q.optionD}</p>
                    <p><strong>Correct:</strong> ${q.correctAnswer}</p>

                    <button class="delete-btn" onclick="deleteMockQuestion(${q.id}, '${courseId}')">
                        Delete Question
                    </button>
                </div>
            `;
        });

    } catch (error) {
        hideLoader();
        console.log(error);
        showToast("Server Error", "error");
    }
}

async function deleteMockQuestion(id, courseId) {
    if (!confirm("Are you sure you want to delete this question?")) {
        return;
    }

    showLoader("Deleting Question...");

    try {
        const res = await apiFetch(`${API_BASE_URL}/mocktest/delete/${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        hideLoader();

        if (res.ok) {
            showToast(data.message, "success");
            loadMockQuestionsForManage();
        } else {
            showToast(data.message || "Delete failed", "error");
        }

    } catch (error) {
        hideLoader();
        console.log(error);
        showToast("Server Error", "error");
    }
}