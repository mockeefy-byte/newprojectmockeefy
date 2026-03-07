
import { useNavigate } from 'react-router-dom'
import { Card, PrimaryButton } from '../pages/ExpertDashboard'
import { toast } from "sonner"
import axios from '../lib/axios';



// Example profile object with sessionsToday data
const profile = {
  sessionsToday: [
    {
      name: 'John Doe',
      type: 'Consultation',
      mode: 'Online',
      time: '10:00 AM',
    },
    {
      name: 'Jane Smith',
      type: 'Training',
      mode: 'Offline',
      time: '2:00 PM',
    },
  ]
}

const ExpertTodaySessions = () => {
  const navigate = useNavigate();

  const handleHostMeeting = async (s: any) => {
    try {
      const response = await axios.post('/api/meetings/create', { expertId: '123' });
      const data = response.data;
      if (data.success) {
        navigate(`/live-meeting?meetingId=${data.meetingId}&role=expert`);
      } else {
        toast.error('Failed to create meeting');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Error connecting to server');
    }
  };

  return (
    <>
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Today's Sessions</h3>
            <p className="text-sm text-gray-500 mt-1">Quick view of today's schedule</p>
          </div>
        </div>

        {profile.sessionsToday?.length ? (
          <div className="space-y-4">
            {profile.sessionsToday.map((s, i) => (
              <div key={i} className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                    {s.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{s.name}</div>
                    <div className="text-sm text-gray-500">{s.type} • {s.mode}</div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="font-semibold text-gray-900">{s.time}</div>
                  <div>
                    <PrimaryButton onClick={() => handleHostMeeting(s)} className="px-4 py-2 text-sm">
                      Host Meeting
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-gray-500">No sessions today</div>
        )}
      </Card>
    </>
  )
}

export default ExpertTodaySessions
