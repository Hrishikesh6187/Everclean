'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import { supabase } from '../lib/supabase';
import { FavoriteBorder, Favorite, Comment, Delete, AddPhotoAlternate } from '@mui/icons-material';
import { Pagination } from '@mui/material'; // Add this import

type Post = {
    post_id: string; // Change from number to string since it's a UUID
    post_content: string;
    post_image: string;
    created_at: string;
    freelancer_id: number;
    profile_photo: string; 
    first_name: string; 
    last_name: string; 
    approved_freelancers: {
      freelancer_id: number;
      first_name: string;
      last_name: string;
      profile_photo: string;
    }[];
    likes_count: number;
    comments_count: number;
    has_liked: boolean;
};

export default function FreelancerPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: number]: Array<{ comment_id: string; comment_content: string; created_at: string; first_name: string; last_name: string; profile_photo: string; }> }>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 5;

  const fetchComments = async (postId: number) => {
    try {
      const { data, error } = await supabase
        .from('comment_details')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
  
      if (error) throw error;
  
      const formattedComments = data?.map(comment => ({
        comment_id: comment.comment_id,
        comment_content: comment.comment_content,
        created_at: comment.created_at,
        first_name: comment.first_name || 'Unknown',
        last_name: comment.last_name || 'User',
        profile_photo: comment.profile_photo || ''
      })) || [];
  
      setComments(prev => ({
        ...prev,
        [postId]: formattedComments
      }));
  
      console.log('Fetched comments:', formattedComments); // For debugging
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  
  // Add this function to handle comment expansion
  const handleExpandComments = (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      fetchComments(postId);
    }
  };
  
  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
  
      // First, get the total count of posts
      const { count } = await supabase
        .from('post_details')
        .select('*', { count: 'exact', head: true })
        .eq('freelancer_id', user.id);

      // Calculate total pages
      setTotalPages(Math.ceil((count || 0) / postsPerPage));

      // Fetch paginated posts
      const { data, error } = await supabase
        .from('post_details')
        .select(`
          post_id,
          post_content,
          image_urls,
          created_at,
          freelancer_id,
          profile_photo,
          first_name,
          last_name,
          likes_count,
          comments_count
        `)
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * postsPerPage, page * postsPerPage - 1);
  
      if (error) throw error;
  
      setPosts(data.map((post) => ({
        post_id: post.post_id,
        post_content: post.post_content,
        post_image: post.image_urls?.[0] || null,
        created_at: post.created_at,
        freelancer_id: post.freelancer_id,
        profile_photo: post.profile_photo || "",
        first_name: post.first_name || "Unknown",
        last_name: post.last_name || "User",
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        has_liked: false, // This will need a separate query to determine if the current user liked the post
        approved_freelancers: [] // This field is no longer needed
      })));
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts');
    }
  };

  // Add delete post function
  const handleDeletePost = async (postId: number) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('post_id', postId);
  
      if (error) throw error;
  
      // Update the posts list
      setPosts(posts.filter(post => post.post_id !== postId));
      
      // Show success message
      setSnackbarMessage('Post deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      setSnackbarMessage(`Failed to delete post: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]); // Add page as dependency

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setPostImage(null);
    setPreviewImage(null);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !postImage) return;
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
  
      let imageUrl = '';
      if (postImage) {
        const fileExt = postImage.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, postImage);
  
        if (uploadError) throw uploadError;
  
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      console.log('Creating post with content:', newPost, 'and image:', imageUrl);

      const { error } = await supabase.from('posts').insert({
        post_content: newPost,
        image_urls: imageUrl ? [imageUrl] : [],
        freelancer_id: user.id
      });

      if (error) throw error;
  
      setNewPost('');
      setPostImage(null);
      setPreviewImage(null);
      fetchPosts();

      // Set success message
      setSnackbarMessage('Post created successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error creating post:', error);

      // Set error message
      setSnackbarMessage(`Failed to create post: ${error.message || error}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Add page change handler
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  useEffect(() => {
    fetchPosts();
  }, [page]); // Add page as dependency

  return (
    <Card sx={{ p: 3, mb: 3, backgroundColor: '#6366f1', color: 'white' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Community Posts</Typography>

      {/* Create Post Section */}
      <Card sx={{ p: 2, mb: 3, backgroundColor: 'white' }}>
        <Box display="flex" gap={2}>
          <Avatar src="" />
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Share your recent work experience..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            {previewImage && (
              <Box sx={{ position: 'relative', mb: 2 }}>
                <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                <IconButton onClick={removeImage} sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Box display="flex" justifyContent="space-between">
              <input accept="image/*" type="file" id="post-image" onChange={handleImageUpload} style={{ display: 'none' }} />
              <label htmlFor="post-image">
                <Button variant="outlined" component="span" startIcon={<AddPhotoAlternate />} sx={{ color: '#6366f1', borderColor: '#6366f1' }}>
                  Add Photo
                </Button>
              </label>
              <Button variant="contained" onClick={handleCreatePost} sx={{ backgroundColor: '#6366f1', '&:hover': { backgroundColor: '#4f46e5' } }}>
                Post
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Snackbar for success or error messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Posts List */}
      {posts.map((post) => (
        <Card key={post.post_id} sx={{ p: 2, mb: 3, backgroundColor: 'white' }}>
          <Box display="flex" gap={2}>
            <Avatar src={post.profile_photo} />
            <Box sx={{ width: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">{post.first_name} {post.last_name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(post.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => handleDeletePost(post.post_id)}
                  sx={{ color: '#ef4444' }}
                >
                  <Delete />
                </IconButton>
              </Box>
              <Typography variant="body1" sx={{ mt: 2 }}>{post.post_content}</Typography>
              {post.post_image && (
                <img 
                  src={post.post_image} 
                  alt="Post" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'cover', 
                    borderRadius: '8px', 
                    marginTop: '16px' 
                  }} 
                />
              )}
              
              {/* Add engagement stats */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mt: 2, 
                pt: 2, 
                borderTop: '1px solid #e5e7eb'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  color: '#6b7280'
                }}>
                  <FavoriteBorder fontSize="small" />
                  <Typography variant="body2">
                    {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    color: '#6b7280',
                    cursor: 'pointer',
                    '&:hover': { color: '#6366f1' }
                  }}
                  onClick={() => handleExpandComments(post.post_id)}
                >
                  <Comment fontSize="small" />
                  <Typography variant="body2">
                    {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
                  </Typography>
                </Box>
              </Box>
              {/* Comments Section - Moved inside the post mapping */}
              {expandedPost === post.post_id && (
                <Box sx={{ mt: 2, pl: 2 }}>
                  {comments[post.post_id]?.map((comment) => (
                    <Box key={comment.comment_id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar src={comment.profile_photo} sx={{ width: 32, height: 32 }} />
                      <Box>
                        <Box sx={{ backgroundColor: '#f3f4f6', p: 1.5, borderRadius: 2 }}>
                          <Typography variant="subtitle2">{comment.first_name} {comment.last_name}</Typography>
                          <Typography variant="body2">{comment.comment_content}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#6b7280', ml: 1 }}>
                          {new Date(comment.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Card>
      ))}

      {/* Add pagination controls */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
                borderColor: 'white',
              },
              '& .Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
              }
            }}
          />
        </Box>
      )}
    </Card>
  );
}
