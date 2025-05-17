document.addEventListener('DOMContentLoaded', function() {
    // Данные приложения
    let students = JSON.parse(localStorage.getItem('students')) || [
        { id: 1, name: "Иванов Иван Иванович", group: "ИТ-101", contact: "ivanov@edu.ru" },
        { id: 2, name: "Петрова Анна Сергеевна", group: "ИТ-102", contact: "petrova@edu.ru" }
    ];

    let books = JSON.parse(localStorage.getItem('books')) || [
        { id: 1, title: "Введение в программирование", author: "Смит Дж.", year: 2020, available: true },
        { id: 2, title: "Основы баз данных", author: "Кузнецов А.А.", year: 2019, available: false }
    ];

    let loans = JSON.parse(localStorage.getItem('loans')) || [
        { id: 1, studentId: 2, bookId: 2, issueDate: new Date().toISOString().split('T')[0], dueDate: "2023-12-31", returned: false }
    ];

    // Элементы DOM
    const loginPage = document.getElementById('login-page');
    const appContent = document.getElementById('app-content');
    const loginForm = document.getElementById('login-form');
    
    // Проверка авторизации при загрузке
if (localStorage.getItem('isLoggedIn')) {
        loginPage.classList.add('d-none');
        appContent.classList.remove('d-none');
        initApp();
    }

    // Обработчик формы входа
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Отменяем стандартную отправку формы
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Проверка логина и пароля (в реальном приложении используйте серверную проверку!)
    if (email === 'bib@lib.ru' && password === '12345') {
        // Сохраняем флаг входа
        localStorage.setItem('isLoggedIn', 'true');
        
        // Скрываем страницу входа и показываем основное приложение
        document.getElementById('login-page').classList.add('d-none');
        document.getElementById('app-content').classList.remove('d-none');
        
        // Инициализируем приложение
        initApp();
    } else {
        alert('Ошибка: Неверный логин или пароль!');
    }
});

    function initApp() {
        // Инициализация приложения после входа
        const studentsTable = document.getElementById('students-table');
        const booksTable = document.getElementById('books-table');
        const loansTable = document.getElementById('loans-table');
        const statsTable = document.getElementById('stats-table');
        const navLinks = document.querySelectorAll('.nav-link');
        const tabSections = document.querySelectorAll('.tab-content');

        // Инициализация модальных окон
        const studentModal = new bootstrap.Modal(document.getElementById('student-modal'));
        const bookModal = new bootstrap.Modal(document.getElementById('book-modal'));
        const loanModal = new bootstrap.Modal(document.getElementById('loan-modal'));

        // Первоначальный рендеринг
        renderAll();

        // Переключение между вкладками
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                tabSections.forEach(section => section.classList.add('d-none'));
                document.getElementById(`${tabId}-section`).classList.remove('d-none');
            });
        });

        // Обработчики кнопок
        document.getElementById('add-student-btn').addEventListener('click', () => showStudentModal());
        document.getElementById('add-book-btn').addEventListener('click', () => showBookModal());
        document.getElementById('add-loan-btn').addEventListener('click', () => showLoanModal());
        document.getElementById('save-student').addEventListener('click', saveStudent);
        document.getElementById('save-book').addEventListener('click', saveBook);
        document.getElementById('save-loan').addEventListener('click', saveLoan);

        // Функции рендеринга
        function renderAll() {
            renderStudents();
            renderBooks();
            renderLoans();
            renderReports();
        }

        function renderStudents() {
            studentsTable.innerHTML = '';
            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.group}</td>
                    <td>${student.contact}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-student" data-id="${student.id}">Редактировать</button>
                        <button class="btn btn-sm btn-danger delete-student" data-id="${student.id}">Удалить</button>
                    </td>
                `;
                studentsTable.appendChild(row);
            });

            // Добавляем обработчики для кнопок в таблице
            document.querySelectorAll('.edit-student').forEach(btn => {
                btn.addEventListener('click', function() {
                    const studentId = parseInt(this.getAttribute('data-id'));
                    editStudent(studentId);
                });
            });

            document.querySelectorAll('.delete-student').forEach(btn => {
                btn.addEventListener('click', function() {
                    const studentId = parseInt(this.getAttribute('data-id'));
                    deleteStudent(studentId);
                });
            });
        }

        function renderBooks() {
            booksTable.innerHTML = '';
            books.forEach(book => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.year}</td>
                    <td>${book.available ? 'Да' : 'Нет'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-book" data-id="${book.id}">Редактировать</button>
                        <button class="btn btn-sm btn-danger delete-book" data-id="${book.id}">Удалить</button>
                    </td>
                `;
                booksTable.appendChild(row);
            });

            document.querySelectorAll('.edit-book').forEach(btn => {
                btn.addEventListener('click', function() {
                    const bookId = parseInt(this.getAttribute('data-id'));
                    editBook(bookId);
                });
            });

            document.querySelectorAll('.delete-book').forEach(btn => {
                btn.addEventListener('click', function() {
                    const bookId = parseInt(this.getAttribute('data-id'));
                    deleteBook(bookId);
                });
            });
        }

        function renderLoans() {
            loansTable.innerHTML = '';
            loans.forEach(loan => {
                const student = students.find(s => s.id === loan.studentId);
                const book = books.find(b => b.id === loan.bookId);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${loan.id}</td>
                    <td>${student ? student.name : 'Неизвестно'}</td>
                    <td>${book ? book.title : 'Неизвестно'}</td>
                    <td>${loan.issueDate}</td>
                    <td>${loan.dueDate}</td>
                    <td>${loan.returned ? 'Возвращена' : 'На руках'}</td>
                    <td>
                        ${!loan.returned ? `<button class="btn btn-sm btn-success return-book" data-id="${loan.id}">Вернуть</button>` : ''}
                        <button class="btn btn-sm btn-danger delete-loan" data-id="${loan.id}">Удалить</button>
                    </td>
                `;
                loansTable.appendChild(row);
            });

            document.querySelectorAll('.return-book').forEach(btn => {
                btn.addEventListener('click', function() {
                    const loanId = parseInt(this.getAttribute('data-id'));
                    returnBook(loanId);
                });
            });

            document.querySelectorAll('.delete-loan').forEach(btn => {
                btn.addEventListener('click', function() {
                    const loanId = parseInt(this.getAttribute('data-id'));
                    deleteLoan(loanId);
                });
            });
        }

        function renderReports() {
            const today = new Date().toISOString().split('T')[0];
            const overdueLoans = loans.filter(loan => !loan.returned && loan.dueDate < today);
            
            renderChart('books-on-loan-chart', 'Книг на руках', loans.filter(l => !l.returned).length);
            renderChart('overdue-books-chart', 'Просроченных книг', overdueLoans.length);
            
            statsTable.innerHTML = '';
            students.forEach(student => {
                const studentLoans = loans.filter(l => l.studentId === student.id);
                const studentOverdue = studentLoans.filter(l => !l.returned && l.dueDate < today);
                const lastLoan = studentLoans.length > 0 
                    ? studentLoans[studentLoans.length - 1].issueDate 
                    : 'Нет выдач';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${studentLoans.length}</td>
                    <td>${studentOverdue.length}</td>
                    <td>${lastLoan}</td>
                `;
                statsTable.appendChild(row);
            });
        }

        function renderChart(elementId, label, value) {
            const ctx = document.createElement('canvas');
            ctx.height = 300;
            document.getElementById(elementId).innerHTML = '';
            document.getElementById(elementId).appendChild(ctx);
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [label, 'Остальные'],
                    datasets: [{
                        data: [value, 100 - value],
                        backgroundColor: ['#0d6efd', '#e9ecef'],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Функции для работы со студентами
        function showStudentModal(student = null) {
            const form = document.getElementById('student-form');
            form.reset();
            
            if (student) {
                document.getElementById('student-modal-title').textContent = 'Редактировать студента';
                document.getElementById('student-id').value = student.id;
                document.getElementById('student-name').value = student.name;
                document.getElementById('student-group').value = student.group;
                document.getElementById('student-contact').value = student.contact;
            } else {
                document.getElementById('student-modal-title').textContent = 'Добавить студента';
            }
            
            studentModal.show();
        }

        function editStudent(id) {
            const student = students.find(s => s.id === id);
            if (student) showStudentModal(student);
        }

        function saveStudent() {
            const id = document.getElementById('student-id').value;
            const name = document.getElementById('student-name').value;
            const group = document.getElementById('student-group').value;
            const contact = document.getElementById('student-contact').value;
            
            if (!name || !group || !contact) {
                alert('Заполните все поля!');
                return;
            }
            
            if (id) {
                // Редактирование
                const index = students.findIndex(s => s.id === parseInt(id));
                if (index !== -1) {
                    students[index] = { id: parseInt(id), name, group, contact };
                }
            } else {
                // Добавление
                const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
                students.push({ id: newId, name, group, contact });
            }
            
            saveData();
            studentModal.hide();
            renderStudents();
        }

        function deleteStudent(id) {
            if (confirm('Удалить этого студента?')) {
                students = students.filter(s => s.id !== id);
                loans = loans.filter(l => l.studentId !== id);
                saveData();
                renderStudents();
                renderLoans();
                renderReports();
            }
        }

        // Функции для работы с книгами
        function showBookModal(book = null) {
            const form = document.getElementById('book-form');
            form.reset();
            
            if (book) {
                document.getElementById('book-modal-title').textContent = 'Редактировать книгу';
                document.getElementById('book-id').value = book.id;
                document.getElementById('book-title').value = book.title;
                document.getElementById('book-author').value = book.author;
                document.getElementById('book-year').value = book.year;
            } else {
                document.getElementById('book-modal-title').textContent = 'Добавить книгу';
            }
            
            bookModal.show();
        }

        function editBook(id) {
            const book = books.find(b => b.id === id);
            if (book) showBookModal(book);
        }

        function saveBook() {
            const id = document.getElementById('book-id').value;
            const title = document.getElementById('book-title').value;
            const author = document.getElementById('book-author').value;
            const year = document.getElementById('book-year').value;
            
            if (!title || !author || !year) {
                alert('Заполните все поля!');
                return;
            }
            
            if (id) {
                // Редактирование
                const index = books.findIndex(b => b.id === parseInt(id));
                if (index !== -1) {
                    books[index] = { 
                        id: parseInt(id), 
                        title, 
                        author, 
                        year: parseInt(year),
                        available: books[index].available
                    };
                }
            } else {
                // Добавление
                const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
                books.push({ id: newId, title, author, year: parseInt(year), available: true });
            }
            
            saveData();
            bookModal.hide();
            renderBooks();
        }

        function deleteBook(id) {
            if (confirm('Удалить эту книгу?')) {
                books = books.filter(b => b.id !== id);
                loans = loans.filter(l => l.bookId !== id);
                saveData();
                renderBooks();
                renderLoans();
                renderReports();
            }
        }

        // Функции для работы с выдачами
        function showLoanModal() {
            const studentSelect = document.getElementById('loan-student');
            const bookSelect = document.getElementById('loan-book');
            
            // Заполняем список студентов
            studentSelect.innerHTML = '<option value="">Выберите студента</option>';
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.group})`;
                studentSelect.appendChild(option);
            });
            
            // Заполняем список доступных книг
            bookSelect.innerHTML = '<option value="">Выберите книгу</option>';
            books.filter(book => book.available).forEach(book => {
                const option = document.createElement('option');
                option.value = book.id;
                option.textContent = `${book.title} (${book.author})`;
                bookSelect.appendChild(option);
            });
            
            // Устанавливаем дату возврата (по умолчанию +14 дней)
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);
            document.getElementById('loan-duedate').value = dueDate.toISOString().split('T')[0];
            
            loanModal.show();
        }

        function saveLoan() {
            const studentId = parseInt(document.getElementById('loan-student').value);
            const bookId = parseInt(document.getElementById('loan-book').value);
            const dueDate = document.getElementById('loan-duedate').value;
            
            if (!studentId || !bookId || !dueDate) {
                alert('Заполните все поля!');
                return;
            }
            
            const today = new Date().toISOString().split('T')[0];
            const newId = loans.length > 0 ? Math.max(...loans.map(l => l.id)) + 1 : 1;
            
            loans.push({
                id: newId,
                studentId,
                bookId,
                issueDate: today,
                dueDate,
                returned: false
            });
            
            // Помечаем книгу как недоступную
            const bookIndex = books.findIndex(b => b.id === bookId);
            if (bookIndex !== -1) {
                books[bookIndex].available = false;
            }
            
            saveData();
            loanModal.hide();
            renderBooks();
            renderLoans();
            renderReports();
        }

        function returnBook(loanId) {
            const loanIndex = loans.findIndex(l => l.id === loanId);
            if (loanIndex !== -1) {
                loans[loanIndex].returned = true;
                
                // Помечаем книгу как доступную
                const bookId = loans[loanIndex].bookId;
                const bookIndex = books.findIndex(b => b.id === bookId);
                if (bookIndex !== -1) {
                    books[bookIndex].available = true;
                }
                
                saveData();
                renderBooks();
                renderLoans();
                renderReports();
            }
        }

        function deleteLoan(loanId) {
            if (confirm('Удалить эту запись о выдаче?')) {
                const loanIndex = loans.findIndex(l => l.id === loanId);
                if (loanIndex !== -1 && !loans[loanIndex].returned) {
                    // Помечаем книгу как доступную, если она не была возвращена
                    const bookId = loans[loanIndex].bookId;
                    const bookIndex = books.findIndex(b => b.id === bookId);
                    if (bookIndex !== -1) {
                        books[bookIndex].available = true;
                    }
                }
                
                loans = loans.filter(l => l.id !== loanId);
                saveData();
                renderBooks();
                renderLoans();
                renderReports();
            }
        }

        // Сохранение данных в localStorage
        function saveData() {
            localStorage.setItem('students', JSON.stringify(students));
            localStorage.setItem('books', JSON.stringify(books));
            localStorage.setItem('loans', JSON.stringify(loans));
        }
    }
});
