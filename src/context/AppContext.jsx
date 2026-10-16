import { createContext, useContext, useMemo } from 'react'
import { seedArticles } from '../data/seed'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [userPosts, setUserPosts] = useLocalStorage('miniflow_posts', [])
  const [deletedIds, setDeletedIds] = useLocalStorage('miniflow_deleted', [])
  const [likedIds, setLikedIds] = useLocalStorage('miniflow_liked', [])
  const [user, setUser] = useLocalStorage('miniflow_user', null)

  // 预置文章 + 我发布的文章 - 我删除的文章
  const articles = useMemo(
    () => [...userPosts, ...seedArticles.filter(a => !deletedIds.includes(a.id))],
    [userPosts, deletedIds]
  )

  const getArticle = id => articles.find(a => a.id === id)
  const isLiked = id => likedIds.includes(id)
  // 点赞数 = 基础点赞数 + 我是否点过赞
  const likeCount = a => a.likes + (isLiked(a.id) ? 1 : 0)

  const toggleLike = id =>
    setLikedIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]))

  const login = name => setUser({ name, joinedAt: new Date().toISOString() })
  const logout = () => setUser(null)

  const publish = ({ title, tags, content }) => {
    const post = {
      id: `u_${Date.now()}`,
      title,
      tags: tags.map(t => t.trim()).filter(Boolean),
      content,
      author: user ? user.name : '匿名用户',
      createdAt: new Date().toISOString().slice(0, 10),
      likes: 0,
    }
    setUserPosts(posts => [post, ...posts])
    return post
  }

  const remove = id => {
    if (id.startsWith('u_')) setUserPosts(posts => posts.filter(p => p.id !== id))
    else setDeletedIds(ids => [...ids, id])
  }

  const value = {
    articles,
    getArticle,
    isLiked,
    likeCount,
    toggleLike,
    user,
    login,
    logout,
    publish,
    remove,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp 必须在 <AppProvider> 内使用')
  return ctx
}
