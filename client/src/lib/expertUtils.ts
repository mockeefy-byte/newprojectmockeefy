export const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

export const calculateProfessionalExperience = (professionalDetails: any) => {
    if (!professionalDetails?.previous?.length) return null;
    let totalMonths = 0;
    const today = new Date();
    professionalDetails.previous.forEach((job: any) => {
        if (job.start) {
            const end = job.end ? new Date(job.end) : today;
            totalMonths += (end.getFullYear() - new Date(job.start).getFullYear()) * 12 + (end.getMonth() - new Date(job.start).getMonth());
        }
    });
    const years = Math.floor(totalMonths / 12);
    return years <= 0 ? "Fresher" : years === 1 ? "1 year" : `${years}+ years`;
};

export const getCurrentCompany = (pd: any, cat: string) => {
    const jobs = pd?.previous || [];
    const current = jobs.find((j: any) => !j.endDate) || jobs.sort((a: any, b: any) => new Date(b.end || 0).getTime() - new Date(a.end || 0).getTime())[0];
    return current?.company || pd?.company || `${cat} Consultant`;
};

export const getJobTitle = (pd: any, cat: string) => {
    const jobs = pd?.previous || [];
    const current = jobs.find((j: any) => !j.end) || jobs.sort((a: any, b: any) => new Date(b.end || 0).getTime() - new Date(a.end || 0).getTime())[0];
    return current?.title || pd?.title || `${cat} Expert`;
};
