# 🤝 Contributing to Multistream

Thank you for your interest in contributing to Multistream! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🎨 Enhance UI/UX
- 🔧 Fix issues
- ✨ Add new features

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   - Click the "Fork" button on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/multistream.git
   cd multistream
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Make your changes**
   - Follow the code style guidelines
   - Write clean, readable code
   - Add comments for complex logic

7. **Test your changes**
   - Test all affected functionality
   - Check responsive design
   - Verify cross-browser compatibility

8. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add awesome feature"
   ```

9. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

10. **Create a Pull Request**
    - Go to the original repository
    - Click "New Pull Request"
    - Select your fork and branch
    - Fill in the PR template

## 📋 Code Style Guidelines

### TypeScript
- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop types

### Styling
- Use Tailwind CSS utility classes
- Follow existing naming conventions
- Ensure responsive design (mobile-first)
- Use semantic color names

### File Structure
```
components/
  ├── ui/           # Reusable UI components
  └── streams/      # Stream-specific components
lib/                # Utility functions and helpers
types/              # TypeScript type definitions
app/                # Next.js app router pages
```

### Naming Conventions
- **Components**: PascalCase (e.g., `StreamEmbed.tsx`)
- **Files**: camelCase for utilities (e.g., `urlParser.ts`)
- **Functions**: camelCase (e.g., `parseURL`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `LAYOUT_CONFIGS`)

## 🔍 Pull Request Guidelines

### PR Checklist
- [ ] Code follows the style guidelines
- [ ] Changes are tested and working
- [ ] No console errors or warnings
- [ ] Responsive design is maintained
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive

### Commit Message Format
Use conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
feat(layouts): add 3x2 grid layout
fix(parser): handle YouTube Shorts URLs
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(storage): simplify localStorage logic
```

## 🐛 Reporting Bugs

### Before Submitting
- Check if the bug has already been reported
- Verify the bug exists in the latest version
- Collect relevant information

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14]
- Node version: [e.g., 18.17.0]
```

## 💡 Suggesting Features

### Feature Request Template
```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you thought about

**Additional Context**
Screenshots, mockups, examples
```

## 🎨 Design Guidelines

### Colors
- Primary: Purple gradient (`from-purple-500 to-pink-500`)
- Background: Dark gray (`bg-gray-900`)
- Text: White/Gray scale
- Platform colors: Defined in `urlParser.ts`

### Spacing
- Use Tailwind spacing scale (1-12, then by 4s)
- Maintain consistent padding/margins
- Responsive spacing with breakpoints

### Animations
- Keep animations subtle and purposeful
- Use existing animation classes when possible
- Duration: 200-300ms for most interactions

## 🧪 Testing

Currently, we don't have automated tests, but here's what to manually test:

### Core Features
- [ ] Add streams from all platforms
- [ ] Switch between layouts
- [ ] Enable/disable theater mode
- [ ] Save and load layouts
- [ ] Remove streams
- [ ] Clear all streams

### Responsive Design
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

## 📝 Documentation

### Code Comments
- Explain **why**, not **what**
- Document complex algorithms
- Add JSDoc for public functions

### README Updates
- Keep installation steps current
- Update feature list
- Add screenshots for visual changes

## ❓ Questions?

- Check existing issues and discussions
- Join our community (if applicable)
- Ask in your PR comments

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Multistream!** 🎉
