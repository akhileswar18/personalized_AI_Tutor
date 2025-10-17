# Contributing to Personalized AI Tutor with Knowledge Graph

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Express.js

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/personalized-ai-tutor-with-knowledge-graph.git`
3. Install dependencies: `npm install`
4. Set up environment variables (see README.md)
5. Start development servers:
   - Backend: `npm run server:dev`
   - Frontend: `npm run dev`

## 📋 How to Contribute

### Reporting Bugs
1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

### Suggesting Features
1. Check existing feature requests
2. Use the feature request template
3. Describe the feature and its benefits
4. Consider implementation complexity

### Code Contributions

#### Types of Contributions
- **Bug fixes**: Fix existing issues
- **New features**: Add new functionality
- **Documentation**: Improve README, comments, or guides
- **Tests**: Add or improve test coverage
- **Performance**: Optimize existing code
- **UI/UX**: Improve user interface and experience

#### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test your changes thoroughly
4. Update documentation if needed
5. Commit with clear messages
6. Push to your fork
7. Create a Pull Request

#### Code Style Guidelines
- Use TypeScript for type safety
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use consistent formatting (Prettier recommended)

#### Commit Message Format
```
type(scope): brief description

Detailed description of changes (if needed)

Fixes #issue-number
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🏗️ Project Structure

### Frontend (`/components`, `/services`)
- React components with TypeScript
- Service layer for API communication
- State management with React hooks

### Backend (`/server`)
- Express.js API endpoints
- Service layer for business logic
- External API integrations (Groq, Gemini)

### Key Areas for Contribution
- **Video Generation**: Enhance narrative structure, improve video quality
- **AI Integration**: Optimize prompts, add new AI providers
- **UI/UX**: Improve user experience, add new features
- **Performance**: Optimize loading times, reduce bundle size
- **Testing**: Add unit tests, integration tests
- **Documentation**: Improve guides, add examples

## 🧪 Testing

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Writing Tests
- Unit tests for utility functions
- Component tests for React components
- Integration tests for API endpoints
- E2E tests for critical user flows

## 📝 Documentation

### Code Documentation
- Use JSDoc for functions and classes
- Add inline comments for complex logic
- Keep README.md updated
- Document API endpoints

### User Documentation
- Update README.md for new features
- Add screenshots for UI changes
- Create guides for complex features
- Maintain troubleshooting section

## 🔍 Code Review Process

### For Contributors
1. Ensure all tests pass
2. Update documentation
3. Request review from maintainers
4. Address feedback promptly
5. Keep PRs focused and small

### For Reviewers
1. Check code quality and style
2. Verify functionality works as expected
3. Ensure tests are adequate
4. Check documentation updates
5. Provide constructive feedback

## 🐛 Bug Fixes

### Priority Levels
- **Critical**: Security issues, data loss, app crashes
- **High**: Major functionality broken
- **Medium**: Minor functionality issues
- **Low**: Cosmetic issues, minor improvements

### Fix Process
1. Reproduce the bug
2. Create a test case
3. Implement the fix
4. Verify the fix works
5. Update tests if needed

## ✨ Feature Development

### Feature Request Process
1. Discuss in issues first
2. Get approval from maintainers
3. Create detailed specification
4. Implement incrementally
5. Add comprehensive tests

### New Feature Checklist
- [ ] Feature specification documented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] UI/UX reviewed
- [ ] Performance impact assessed
- [ ] Backward compatibility maintained

## 🚀 Release Process

### Version Numbering
- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, minor improvements

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes prepared

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions, ideas
- **Pull Requests**: Code reviews, technical discussions

### Response Times
- **Critical bugs**: Within 24 hours
- **Regular issues**: Within 3-5 days
- **Feature requests**: Within 1-2 weeks
- **Pull requests**: Within 3-7 days

## 🎯 Contribution Ideas

### Beginner-Friendly
- Fix typos in documentation
- Improve error messages
- Add loading states
- Enhance accessibility
- Write tests for existing code

### Intermediate
- Add new video generation features
- Implement new quiz types
- Optimize performance
- Add new AI providers
- Improve mobile responsiveness

### Advanced
- Implement real-time collaboration
- Add advanced analytics
- Create plugin system
- Optimize video processing
- Add offline support

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to make education more accessible and engaging!
