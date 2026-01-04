// app/store/useSubmissionStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../../lib/axios';

export const useSubmissionStore = create(
  persist(
    (set, get) => ({
      // State
      submissions: [],
      allSubmissions: [],
      conferences: [],
      assignedReviews: [],
      isLoading: false,
      error: null,
      
      // Actions
      setSubmissions: (submissions) => set({ submissions }),
      setAllSubmissions: (allSubmissions) => set({ allSubmissions }),
      setConferences: (conferences) => set({ conferences }),
      setAssignedReviews: (assignedReviews) => set({ assignedReviews }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Fetch data based on role
      fetchDashboardData: async (role) => {
        console.log('Fetching data for role:', role);
        set({ isLoading: true, error: null });
        
        try {
          let promises = [];
          
          // All roles need conferences
          promises.push(axios.get("/conferences"));
          
          // Fetch based on role
          switch(role) {
            case 'authors':
              console.log('Fetching author data...');
              promises.push(axios.get("/submissions/me"));
              promises.push(axios.get("/submissions"));
              break;
            case 'reviewer':
              promises.push(axios.get("/reviews/assigned"));
              break;
            case 'chair':
            case 'admin':
              promises.push(axios.get("/submissions"));
              break;
            default:
              promises.push(axios.get("/submissions/me"));
          }
          
          const results = await Promise.all(promises);
          console.log('API Results:', results);
          
          const conferenceRes = results[0];
          
          // Process results based on role
          let newState = {
            conferences: (conferenceRes.data?.conferences || []).filter(c => c.is_open),
            isLoading: false,
            error: null
          };
          
          if (role === 'authors' && results[1]) {
            console.log('Author submissions:', results[1].data);
            newState.submissions = results[1].data || [];
            if (results[2]) {
              newState.allSubmissions = results[2].data || [];
            }
          } else if (role === 'reviewer' && results[1]) {
            newState.assignedReviews = results[1].data || [];
          } else if ((role === 'chair' || role === 'admin') && results[1]) {
            newState.allSubmissions = results[1].data || [];
          }
          
          console.log('New store state:', newState);
          set(newState);
          
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to fetch data'
          });
        }
      },
      
      // Getters with computed values
      getCounts: () => {
        const allSubmissions = get().allSubmissions;
        console.log('All submissions for counts:', allSubmissions);
        const total = allSubmissions.filter(p => !p.is_withdrawn).length;
        const accepted = allSubmissions.filter(p => p.status === "Accepted").length;
        const rejected = allSubmissions.filter(p => p.status === "Rejected").length;
        const underReview = total - accepted - rejected;
        return { total, accepted, rejected, underReview };
      },
      
      getMyCounts: () => {
        const submissions = get().submissions;
        console.log('My submissions for counts:', submissions);
        const myTotal = submissions.length;
        const myAccepted = submissions.filter(p => p.status === "Accepted").length;
        const myRejected = submissions.filter(p => p.status === "Rejected").length;
        const myUnderReview = myTotal - myAccepted - myRejected;
        return { total: myTotal, accepted: myAccepted, rejected: myRejected, underReview: myUnderReview };
      },
      
      // Clear store
      clearStore: () => set({ 
        submissions: [], 
        allSubmissions: [], 
        conferences: [], 
        assignedReviews: [],
        isLoading: false,
        error: null
      }),
    }),
    {
      name: 'submission-storage',
      partialize: (state) => ({ 
        submissions: state.submissions,
        allSubmissions: state.allSubmissions,
        conferences: state.conferences,
        assignedReviews: state.assignedReviews
      }),
    }
  )
);