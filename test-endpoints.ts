async function test() {
  try {
    const batchRes = await fetch('http://localhost:3000/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Test Batch",
        description: "This is a test batch description",
        price: "FREE",
        targetClass: "Class 10th",
        subjects: ["Science"]
      })
    });
    console.log('BATCH STATUS:', batchRes.status);
    const batchData = await batchRes.json();
    console.log('BATCH DATA:', batchData);

    if (batchRes.status === 200 && batchData.id) {
      const lecRes = await fetch('http://localhost:3000/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batchData.id,
          title: "Test Lecture",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          order: 1,
          subject: "Science"
        })
      });
      console.log('LEC STATUS:', lecRes.status);
      const lecData = await lecRes.json();
      console.log('LEC DATA:', lecData);
    }
  } catch (err: any) {
    console.log('ERROR:', err.message);
  }
}

test();
